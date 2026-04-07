from email.utils import parsedate_to_datetime
from pathlib import Path

from dedup import dedup_articles
from feed import fetch_feeds, fetch_items
from segregator import segregate_articles_by_keywords


def _parse_date(article):
    """Return a sortable datetime for an article, falling back to epoch on failure."""
    from datetime import datetime, timezone
    raw = article.get("published") or ""
    for parser in (parsedate_to_datetime, datetime.fromisoformat):
        try:
            dt = parser(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            continue
    return datetime(1970, 1, 1, tzinfo=timezone.utc)


BASE_DIR = Path(__file__).resolve().parent


def run_pipeline(keywords, feeds_file="feeds.csv", verbose=False):
    feeds_path = BASE_DIR / feeds_file
    master_articles = []

    feeds = fetch_feeds(str(feeds_path))
    if verbose:
        print(f"fetched feed count: {len(feeds)}")

    for feed_url in feeds:
        articles = fetch_items(feed_url)
        if verbose:
            print(f"Feed: {feed_url} -> {len(articles)}")
        master_articles.extend(articles)

    unique_articles = dedup_articles(master_articles)
    grouped = segregate_articles_by_keywords(unique_articles, keywords)

    return {
        "feeds_count": len(feeds),
        "master_count": len(master_articles),
        "unique_count": len(unique_articles),
        "grouped": grouped,
    }


def run_pipeline_with_feeds(keywords, feed_urls, verbose=False):
    master_articles = []

    feeds = []
    for item in (feed_urls or []):
        if isinstance(item, dict):
            url = str(item.get("url") or "").strip()
            category = str(item.get("category") or "news").strip().lower()
        else:
            url = str(item).strip()
            category = "news"

        if not url:
            continue

        if category not in ("news", "filing", "press"):
            category = "news"

        feeds.append({"url": url, "category": category})

    if verbose:
        print(f"fetched feed count: {len(feeds)}")

    for feed in feeds:
        feed_url = feed["url"]
        feed_category = feed["category"]
        articles = fetch_items(feed_url)
        for article in articles:
            article["type"] = feed_category
        if verbose:
            print(f"Feed: {feed_url} -> {len(articles)}")
        master_articles.extend(articles)

    unique_articles = dedup_articles(master_articles)
    grouped = segregate_articles_by_keywords(unique_articles, keywords)

    return {
        "feeds_count": len(feeds),
        "master_count": len(master_articles),
        "unique_count": len(unique_articles),
        "grouped": grouped,
    }


def build_user_feed(keywords, feeds_file="feeds.csv", verbose=False, feed_urls=None):
    if feed_urls is not None:
        result = run_pipeline_with_feeds(keywords=keywords, feed_urls=feed_urls, verbose=verbose)
    else:
        result = run_pipeline(keywords=keywords, feeds_file=feeds_file, verbose=verbose)

    merged = []
    for keyword in keywords:
        for article in result["grouped"].get(keyword, []):
            enriched = dict(article)
            enriched["matched_keyword"] = keyword
            merged.append(enriched)

    # Final dedup at user-feed level (article can match multiple keywords).
    deduped = dedup_articles(merged)
    # Sort newest-first so the limit applied by the API cuts evenly across companies.
    deduped.sort(key=_parse_date, reverse=True)
    return deduped


if __name__ == "__main__":
    keys = ["Apollo", "Indag", "Midas", "JK", "CEAT"]
    pipeline_result = run_pipeline(keys, verbose=True)

    print(f"master_articles count: {pipeline_result['master_count']}")
    print(f"unique_articles count: {pipeline_result['unique_count']}")

    for key in keys:
        print(f"{key} count: {len(pipeline_result['grouped'].get(key, []))}")




