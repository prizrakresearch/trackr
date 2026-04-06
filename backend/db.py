import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import List

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
