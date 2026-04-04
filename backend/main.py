from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from db import get_watchlist, init_db, save_watchlist
from pipeline import build_user_feed


class WatchlistRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=64)
    keywords: List[str] = Field(default_factory=list, max_length=50)


class WatchlistResponse(BaseModel):
    user_id: str
    keywords: List[str] = Field(default_factory=list)
    count: int


class FeedItem(BaseModel):
    title: Optional[str] = None
    link: str
    summary: Optional[str] = None
    published: Optional[str] = None
    source: Optional[str] = None
    matched_keyword: Optional[str] = None


class FeedResponse(BaseModel):
    items: List[FeedItem] = Field(default_factory=list)
    total: int
    user_id: str
    applied_keywords: List[str] = Field(default_factory=list)


app = FastAPI(title="Trackr Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/watchlist", response_model=WatchlistResponse)
def upsert_watchlist(payload: WatchlistRequest):
    user_id = payload.user_id.strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    saved = save_watchlist(user_id=user_id, keywords=payload.keywords)
    return WatchlistResponse(user_id=user_id, keywords=saved, count=len(saved))


@app.get("/api/watchlist", response_model=WatchlistResponse)
def read_watchlist(user_id: str = Query(..., min_length=1, max_length=64)):
    keywords = get_watchlist(user_id.strip())
    return WatchlistResponse(user_id=user_id.strip(), keywords=keywords, count=len(keywords))


@app.get("/api/feed", response_model=FeedResponse)
def read_feed(
    user_id: str = Query(..., min_length=1, max_length=64),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
):
    uid = user_id.strip()
    keywords = get_watchlist(uid)

    if not keywords:
        return FeedResponse(items=[], total=0, user_id=uid, applied_keywords=[])

    try:
        items = build_user_feed(keywords=keywords)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"feed pipeline failed: {exc}")

    if search:
        query = search.strip().lower()
        if query:
            items = [
                item
                for item in items
                if query in (item.get("title") or "").lower()
                or query in (item.get("summary") or "").lower()
            ]

    total = len(items)
    paged = items[offset : offset + limit]

    return FeedResponse(
        items=[FeedItem(**item) for item in paged],
        total=total,
        user_id=uid,
        applied_keywords=keywords,
    )
