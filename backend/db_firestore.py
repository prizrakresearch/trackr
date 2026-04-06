import csv
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from urllib.parse import urlparse

from google.cloud import firestore


BASE_DIR = Path(__file__).resolve().parent
_FIRESTORE_CLIENT: firestore.Client | None = None


def _client() -> firestore.Client:
    global _FIRESTORE_CLIENT
    if _FIRESTORE_CLIENT is None:
        _FIRESTORE_CLIENT = firestore.Client()
    return _FIRESTORE_CLIENT


def _user_doc(user_id: str):
    return _client().collection("users").document(user_id)


def init_db() -> None:
    # Firestore is schemaless; this call only ensures credentials are valid.
    _client()


def _normalize_keywords(keywords: List[str]) -> List[str]:
    seen = set()
    normalized = []
    for value in keywords:
        cleaned = (value or "").strip()
        if not cleaned:
            continue
        marker = cleaned.lower()
        if marker not in seen:
            seen.add(marker)
            normalized.append(cleaned)
    return normalized


def _is_http_url(value: str) -> bool:
    parsed = urlparse((value or "").strip())
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _make_label(url: str) -> str:
    parsed = urlparse(url)
    host = (parsed.netloc or "").replace("www.", "")
    return host or "RSS feed"


def _normalize_source_category(value: str | None) -> str:
    normalized = str(value or "news").strip().lower()
    if normalized in ("filing", "filings", "corporate-filing", "corporate_filings", "corporate filings"):
        return "filing"
    if normalized in ("press", "pressrelease", "press-release", "press_releases", "press releases"):
        return "press"
    return "news"


def _normalize_feed_sources(sources: list[dict]) -> list[dict]:
    normalized = []
    seen = set()

    for entry in sources or []:
        if not isinstance(entry, dict):
            continue

        raw_url = str(entry.get("url") or entry.get("feed_url") or "").strip()
        if not _is_http_url(raw_url):
            continue

        marker = raw_url.lower()
        if marker in seen:
            continue
        seen.add(marker)

        label = str(entry.get("label") or "").strip() or _make_label(raw_url)
        source_id = str(entry.get("id") or "").strip() or uuid.uuid4().hex[:12]
        enabled = bool(entry.get("enabled", True))
        category = _normalize_source_category(entry.get("category"))

        normalized.append(
            {
                "id": source_id,
                "url": raw_url,
                "label": label,
                "enabled": enabled,
                "category": category,
            }
        )

    return normalized


def _load_default_feed_sources() -> list[dict]:
    feeds_path = BASE_DIR / "feeds.csv"
    if not feeds_path.exists():
        return []

    rows = []
    with feeds_path.open(newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            feed_url = str(row.get("feed_url") or "").strip()
            if feed_url:
                rows.append({"url": feed_url})

    return _normalize_feed_sources(rows)


def save_watchlist(user_id: str, keywords: List[str]) -> List[str]:
    normalized = _normalize_keywords(keywords)
    now = datetime.now(timezone.utc).isoformat()

    _user_doc(user_id).set(
        {
            "watchlist": {
                "keywords": normalized,
                "updated_at": now,
            }
        },
        merge=True,
    )

    invalidate_feed_cache(user_id)
    return normalized


def get_watchlist(user_id: str) -> List[str]:
    snapshot = _user_doc(user_id).get()
    if not snapshot.exists:
        return []

    data = snapshot.to_dict() or {}
    watchlist = data.get("watchlist") or {}
    keywords = watchlist.get("keywords")
    if isinstance(keywords, list):
        return [str(item) for item in keywords]
    return []


def get_feed_sources(user_id: str) -> list[dict]:
    snapshot = _user_doc(user_id).get()
    if not snapshot.exists:
        return _load_default_feed_sources()

    data = snapshot.to_dict() or {}
    payload = data.get("feed_sources") or {}
    sources = payload.get("sources")
    if not isinstance(sources, list):
        return _load_default_feed_sources()

    return _normalize_feed_sources(sources)


def save_feed_sources(user_id: str, sources: list[dict]) -> list[dict]:
    normalized = _normalize_feed_sources(sources)
    now = datetime.now(timezone.utc).isoformat()

    _user_doc(user_id).set(
        {
            "feed_sources": {
                "sources": normalized,
                "updated_at": now,
            }
        },
        merge=True,
    )

    invalidate_feed_cache(user_id)
    return normalized


def add_feed_source(
    user_id: str,
    url: str,
    label: str = "",
    enabled: bool = True,
    category: str = "news",
) -> dict:
    sources = get_feed_sources(user_id)
    candidate = {
        "url": str(url or "").strip(),
        "label": label,
        "enabled": enabled,
        "category": category,
    }

    merged = save_feed_sources(user_id, [*sources, candidate])
    target_url = str(url or "").strip().lower()
    for source in merged:
        if str(source.get("url") or "").strip().lower() == target_url:
            return source

    raise ValueError("failed to add feed source")


def update_feed_source(
    user_id: str,
    source_id: str,
    *,
    url: str | None = None,
    label: str | None = None,
    enabled: bool | None = None,
    category: str | None = None,
) -> dict:
    found = False
    updated = []

    for source in get_feed_sources(user_id):
        current = dict(source)
        if str(current.get("id")) == source_id:
            found = True
            if url is not None:
                current["url"] = str(url).strip()
            if label is not None:
                current["label"] = str(label).strip()
            if enabled is not None:
                current["enabled"] = bool(enabled)
            if category is not None:
                current["category"] = _normalize_source_category(category)
        updated.append(current)

    if not found:
        raise ValueError("feed source not found")

    normalized = save_feed_sources(user_id, updated)
    for source in normalized:
        if str(source.get("id")) == source_id:
            return source

    raise ValueError("feed source update failed")


def delete_feed_source(user_id: str, source_id: str) -> list[dict]:
    existing = get_feed_sources(user_id)
    filtered = [source for source in existing if str(source.get("id")) != source_id]
    if len(filtered) == len(existing):
        raise ValueError("feed source not found")
    return save_feed_sources(user_id, filtered)


def invalidate_feed_cache(user_id: str) -> None:
    _user_doc(user_id).set({"feed_cache": firestore.DELETE_FIELD}, merge=True)


def save_feed_cache(user_id: str, keywords: List[str], payload: dict) -> None:
    cached_at = datetime.now(timezone.utc).isoformat()
    _user_doc(user_id).set(
        {
            "feed_cache": {
                "payload": payload,
                "keywords": _normalize_keywords(keywords),
                "cached_at": cached_at,
            }
        },
        merge=True,
    )


def get_feed_cache(user_id: str) -> dict | None:
    snapshot = _user_doc(user_id).get()
    if not snapshot.exists:
        return None

    data = snapshot.to_dict() or {}
    feed_cache = data.get("feed_cache")
    if not isinstance(feed_cache, dict):
        return None

    payload = feed_cache.get("payload")
    cached_keywords = feed_cache.get("keywords")
    cached_at = feed_cache.get("cached_at")
    if not isinstance(payload, dict):
        return None

    try:
        if isinstance(cached_at, str):
            cached_time = datetime.fromisoformat(cached_at)
        elif isinstance(cached_at, datetime):
            cached_time = cached_at
        else:
            return None
    except (ValueError, TypeError):
        return None

    return {
        "payload": payload,
        "keywords": cached_keywords if isinstance(cached_keywords, list) else [],
        "cached_at": cached_time,
    }
