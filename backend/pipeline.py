from pathlib import Path

from dedup import dedup_articles
from feed import fetch_feeds, fetch_items
from segregator import segregate_articles_by_keywords


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

    feeds = [str(url).strip() for url in (feed_urls or []) if str(url).strip()]
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
    return dedup_articles(merged)


if __name__ == "__main__":
    keys = ["Apollo", "Indag", "Midas", "JK", "CEAT"]
    pipeline_result = run_pipeline(keys, verbose=True)

    print(f"master_articles count: {pipeline_result['master_count']}")
    print(f"unique_articles count: {pipeline_result['unique_count']}")

    for key in keys:
        print(f"{key} count: {len(pipeline_result['grouped'].get(key, []))}")




