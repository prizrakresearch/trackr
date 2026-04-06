import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from urllib.parse import urlparse

import csv

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "trackr.db"


def _get_conn():
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    with _get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_watchlist (
                user_id TEXT PRIMARY KEY,
                keywords_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_feed_cache (
                user_id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                keywords_json TEXT NOT NULL,
                cached_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_feed_sources (
                user_id TEXT PRIMARY KEY,
                sources_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


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

        normalized.append(
            {
                "id": source_id,
                "url": raw_url,
                "label": label,
                "enabled": enabled,
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
    payload = json.dumps(normalized)
    now = datetime.now(timezone.utc).isoformat()

    with _get_conn() as conn:
        conn.execute(
            """
            INSERT INTO user_watchlist (user_id, keywords_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                keywords_json=excluded.keywords_json,
                updated_at=excluded.updated_at
            """,
            (user_id, payload, now),
        )
        conn.commit()

    invalidate_feed_cache(user_id)
    return normalized


def get_watchlist(user_id: str) -> List[str]:
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT keywords_json FROM user_watchlist WHERE user_id = ?",
            (user_id,),
        ).fetchone()

    if not row:
        return []

    try:
        data = json.loads(row[0])
        if isinstance(data, list):
            return [str(item) for item in data]
    except json.JSONDecodeError:
        return []

    return []


def get_feed_sources(user_id: str) -> list[dict]:
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT sources_json FROM user_feed_sources WHERE user_id = ?",
            (user_id,),
        ).fetchone()

    if not row:
        return _load_default_feed_sources()

    try:
        data = json.loads(row[0])
    except json.JSONDecodeError:
        return _load_default_feed_sources()

    return _normalize_feed_sources(data if isinstance(data, list) else [])


def save_feed_sources(user_id: str, sources: list[dict]) -> list[dict]:
    normalized = _normalize_feed_sources(sources)
    now = datetime.now(timezone.utc).isoformat()

    with _get_conn() as conn:
        conn.execute(
            """
            INSERT INTO user_feed_sources (user_id, sources_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                sources_json=excluded.sources_json,
                updated_at=excluded.updated_at
            """,
            (user_id, json.dumps(normalized), now),
        )
        conn.commit()

    invalidate_feed_cache(user_id)
    return normalized


def add_feed_source(user_id: str, url: str, label: str = "", enabled: bool = True) -> dict:
    sources = get_feed_sources(user_id)
    candidate = {"url": str(url or "").strip(), "label": label, "enabled": enabled}

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
    with _get_conn() as conn:
        conn.execute("DELETE FROM user_feed_cache WHERE user_id = ?", (user_id,))
        conn.commit()


def save_feed_cache(user_id: str, keywords: List[str], payload: dict) -> None:
    cached_at = datetime.now(timezone.utc).isoformat()
    with _get_conn() as conn:
        conn.execute(
            """
            INSERT INTO user_feed_cache (user_id, payload_json, keywords_json, cached_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                payload_json=excluded.payload_json,
                keywords_json=excluded.keywords_json,
                cached_at=excluded.cached_at
            """,
            (
                user_id,
                json.dumps(payload),
                json.dumps(_normalize_keywords(keywords)),
                cached_at,
            ),
        )
        conn.commit()


def get_feed_cache(user_id: str) -> dict | None:
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT payload_json, keywords_json, cached_at FROM user_feed_cache WHERE user_id = ?",
            (user_id,),
        ).fetchone()

    if not row:
        return None

    payload_json, keywords_json, cached_at = row
    try:
        payload = json.loads(payload_json)
        cached_keywords = json.loads(keywords_json)
        cached_time = datetime.fromisoformat(cached_at)
    except (json.JSONDecodeError, ValueError, TypeError):
        return None

    return {
        "payload": payload,
        "keywords": cached_keywords if isinstance(cached_keywords, list) else [],
        "cached_at": cached_time,
    }
