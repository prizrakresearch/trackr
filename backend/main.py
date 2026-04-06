import csv
import io
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

from article_reader import fetch_article_content
from db import (
    add_feed_source,
    delete_feed_source,
    get_feed_cache,
    get_feed_sources,
    get_watchlist,
    init_db,
    save_feed_cache,
    save_watchlist,
    update_feed_source,
)
from pipeline import build_user_feed


CACHE_TTL_SECONDS = 2 * 60 * 60


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
    type: Optional[str] = "news"


class FeedResponse(BaseModel):
    items: List[FeedItem] = Field(default_factory=list)
    total: int
    user_id: str
    applied_keywords: List[str] = Field(default_factory=list)


class FeedSource(BaseModel):
    id: str
    url: str
    label: str
    enabled: bool = True
    category: str = "news"


class FeedSourcesResponse(BaseModel):
    user_id: str
    sources: List[FeedSource] = Field(default_factory=list)
    count: int


class FeedSourceCreateRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=64)
    url: str = Field(min_length=8, max_length=2048)
    label: Optional[str] = Field(default=None, max_length=120)
    enabled: bool = True
    category: str = Field(default="news", max_length=32)


class FeedSourceUpdateRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=64)
    url: Optional[str] = Field(default=None, min_length=8, max_length=2048)
    label: Optional[str] = Field(default=None, max_length=120)
    enabled: Optional[bool] = None
    category: Optional[str] = Field(default=None, max_length=32)


class ArticleReadResponse(BaseModel):
    url: str
    title: str = ""
    summary: str = ""
    content: str = ""
    images: List[str] = Field(default_factory=list)
    mode: str = "direct"


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
    refresh: bool = Query(False),
):
    uid = user_id.strip()
    keywords = get_watchlist(uid)
    sources = get_feed_sources(uid)
    feed_urls = [source for source in sources if source.get("enabled", True)]

    if not keywords:
        save_feed_cache(
            uid,
            keywords=[],
            payload={"items": [], "total": 0, "user_id": uid, "applied_keywords": []},
        )
        return FeedResponse(items=[], total=0, user_id=uid, applied_keywords=[])

    cached = None if refresh else get_feed_cache(uid)
    if cached:
        cached_keywords = [str(item) for item in cached.get("keywords", [])]
        cached_at = cached.get("cached_at")
        if cached_keywords == keywords and isinstance(cached_at, datetime):
            age_seconds = (datetime.now(timezone.utc) - cached_at).total_seconds()
            if age_seconds <= CACHE_TTL_SECONDS:
                payload = cached.get("payload") or {}
                items = payload.get("items", [])
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

    try:
        items = build_user_feed(keywords=keywords, feed_urls=feed_urls)
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

    cache_payload = {
        "items": items,
        "total": total,
        "user_id": uid,
        "applied_keywords": keywords,
    }
    save_feed_cache(uid, keywords=keywords, payload=cache_payload)

    return FeedResponse(
        items=[FeedItem(**item) for item in paged],
        total=total,
        user_id=uid,
        applied_keywords=keywords,
    )


@app.get("/api/article/read", response_model=ArticleReadResponse)
def read_article(url: str = Query(..., min_length=8, max_length=2048)):
    target = url.strip()
    if not (target.startswith("http://") or target.startswith("https://")):
        raise HTTPException(status_code=400, detail="url must start with http:// or https://")

    try:
        payload = fetch_article_content(target)
        return ArticleReadResponse(**payload)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"article fetch failed: {exc}")


@app.get("/api/feed-sources", response_model=FeedSourcesResponse)
def read_feed_sources(user_id: str = Query(..., min_length=1, max_length=64)):
    uid = user_id.strip()
    sources = get_feed_sources(uid)
    return FeedSourcesResponse(
        user_id=uid,
        sources=[FeedSource(**source) for source in sources],
        count=len(sources),
    )


@app.get("/api/feed-sources/export")
def export_feed_sources(user_id: str = Query(..., min_length=1, max_length=64)):
    uid = user_id.strip()
    sources = [source for source in get_feed_sources(uid) if source.get("enabled", True)]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["feed_url", "category"])
    for source in sources:
        writer.writerow([source.get("url", ""), source.get("category", "news")])

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    file_name = f"trackr-feed-sources-{uid}-{stamp}.csv"
    content = output.getvalue()

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
    )


@app.post("/api/feed-sources", response_model=FeedSource)
def create_feed_source(payload: FeedSourceCreateRequest):
    uid = payload.user_id.strip()
    target = payload.url.strip()
    if not (target.startswith("http://") or target.startswith("https://")):
        raise HTTPException(status_code=400, detail="url must start with http:// or https://")

    try:
        source = add_feed_source(
            uid,
            url=target,
            label=payload.label or "",
            enabled=payload.enabled,
            category=payload.category,
        )
        return FeedSource(**source)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.patch("/api/feed-sources/{source_id}", response_model=FeedSource)
def patch_feed_source(source_id: str, payload: FeedSourceUpdateRequest):
    uid = payload.user_id.strip()
    if payload.url is not None:
        target = payload.url.strip()
        if not (target.startswith("http://") or target.startswith("https://")):
            raise HTTPException(status_code=400, detail="url must start with http:// or https://")

    try:
        updated = update_feed_source(
            uid,
            source_id=source_id,
            url=payload.url.strip() if payload.url is not None else None,
            label=payload.label,
            enabled=payload.enabled,
            category=payload.category,
        )
        return FeedSource(**updated)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.delete("/api/feed-sources", response_model=FeedSourcesResponse)
def remove_feed_source(
    user_id: str = Query(..., min_length=1, max_length=64),
    source_id: str = Query(..., min_length=1, max_length=64),
):
    uid = user_id.strip()
    try:
        remaining = delete_feed_source(uid, source_id=source_id)
        return FeedSourcesResponse(
            user_id=uid,
            sources=[FeedSource(**source) for source in remaining],
            count=len(remaining),
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
