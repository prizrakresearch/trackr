import feedparser
import csv
import requests

# Fetches the feed URLs from the input CSV file and returns them as a list.
def fetch_feeds(file_path):
    feeds = []

    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            feeds.append(row["feed_url"])
    return feeds

# Fetches the items from the input RSS feed nad returns the article list as a JSON.
def fetch_items(feed_url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(feed_url, headers=headers, timeout=10)
        feed = feedparser.parse(r.text)
    except Exception as e:
        print(f"Error fetching {feed_url}: {e}")
        return []

    articles = []
    source_name = feed.feed.get("title", "Unknown Source")

    for entry in feed.entries:
        articles.append({
            "title": entry.get("title"),
            "link": entry.get("link"),
            "summary": entry.get("summary"),
            "published": entry.get("published"),
            "source": source_name,
        })

    return articles
