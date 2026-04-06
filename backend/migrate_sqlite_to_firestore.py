import json
import sqlite3
from pathlib import Path

from db_firestore import save_feed_cache, save_feed_sources, save_watchlist


BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = BASE_DIR / "trackr.db"


def migrate_watchlists(conn: sqlite3.Connection) -> int:
    rows = conn.execute("SELECT user_id, keywords_json FROM user_watchlist").fetchall()
    migrated = 0
    for user_id, keywords_json in rows:
        try:
            keywords = json.loads(keywords_json)
            if not isinstance(keywords, list):
                keywords = []
        except json.JSONDecodeError:
            keywords = []

        save_watchlist(str(user_id), [str(item) for item in keywords])
        migrated += 1
    return migrated


def migrate_feed_sources(conn: sqlite3.Connection) -> int:
    rows = conn.execute("SELECT user_id, sources_json FROM user_feed_sources").fetchall()
    migrated = 0
    for user_id, sources_json in rows:
        try:
            sources = json.loads(sources_json)
            if not isinstance(sources, list):
                sources = []
        except json.JSONDecodeError:
            sources = []

        save_feed_sources(str(user_id), sources)
        migrated += 1
    return migrated


def migrate_feed_cache(conn: sqlite3.Connection) -> int:
    rows = conn.execute("SELECT user_id, payload_json, keywords_json FROM user_feed_cache").fetchall()
    migrated = 0

    for user_id, payload_json, keywords_json in rows:
        try:
            payload = json.loads(payload_json)
            if not isinstance(payload, dict):
                payload = {}
        except json.JSONDecodeError:
            payload = {}

        try:
            keywords = json.loads(keywords_json)
            if not isinstance(keywords, list):
                keywords = []
        except json.JSONDecodeError:
            keywords = []

        save_feed_cache(str(user_id), [str(item) for item in keywords], payload)
        migrated += 1

    return migrated


def main() -> None:
    if not SQLITE_PATH.exists():
        raise FileNotFoundError(f"SQLite database not found at: {SQLITE_PATH}")

    with sqlite3.connect(SQLITE_PATH) as conn:
        watchlists = migrate_watchlists(conn)
        sources = migrate_feed_sources(conn)
        cache_rows = migrate_feed_cache(conn)

    print(f"Migrated watchlists: {watchlists}")
    print(f"Migrated feed source docs: {sources}")
    print(f"Migrated feed cache docs: {cache_rows}")


if __name__ == "__main__":
    main()
