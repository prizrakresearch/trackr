import csv
import requests
import xml.etree.ElementTree as ET

# Fetches the feed URLs from the input CSV file and returns them as a list.
def fetch_feeds(file_path):
    feeds = []

    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            feeds.append(row["feed_url"])
    return feeds


def _text(node, path, default=""):
    found = node.find(path)
    if found is None or found.text is None:
        return default
    return found.text.strip()


def _parse_rss(xml_text, source_name):
    articles = []
    root = ET.fromstring(xml_text)

    # RSS 2.0 format
    channel = root.find("channel")
    if channel is not None:
        resolved_source = _text(channel, "title", source_name) or source_name
        for item in channel.findall("item"):
            link = _text(item, "link")
            if not link:
                continue
            articles.append(
                {
                    "title": _text(item, "title"),
                    "link": link,
                    "summary": _text(item, "description"),
                    "published": _text(item, "pubDate"),
                    "source": resolved_source,
                }
            )
        return articles

    # Atom format
    atom_ns = "{http://www.w3.org/2005/Atom}"
    if root.tag.endswith("feed"):
        resolved_source = _text(root, f"{atom_ns}title", source_name) or source_name
        for entry in root.findall(f"{atom_ns}entry"):
            link = ""
            for link_node in entry.findall(f"{atom_ns}link"):
                href = (link_node.attrib.get("href") or "").strip()
                rel = (link_node.attrib.get("rel") or "alternate").strip()
                if href and rel in ("alternate", ""):
                    link = href
                    break

            if not link:
                continue

            summary = _text(entry, f"{atom_ns}summary") or _text(entry, f"{atom_ns}content")
            published = _text(entry, f"{atom_ns}published") or _text(entry, f"{atom_ns}updated")

            articles.append(
                {
                    "title": _text(entry, f"{atom_ns}title"),
                    "link": link,
                    "summary": summary,
                    "published": published,
                    "source": resolved_source,
                }
            )

    return articles

# Fetches the items from the input RSS feed nad returns the article list as a JSON.
def fetch_items(feed_url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(feed_url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching {feed_url}: {e}")
        return []

    try:
        return _parse_rss(response.text, source_name=feed_url)
    except Exception as e:
        print(f"Error parsing feed {feed_url}: {e}")
        return []
