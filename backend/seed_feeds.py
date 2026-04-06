#!/usr/bin/env python3
"""
Seed default feed sources for a user or all users.
Usage:
  python seed_feeds.py --user anon_539820b6047f4c86ac90398c0108afb3
  python seed_feeds.py --wipe-all
"""

import argparse
import csv
import sys
from pathlib import Path

from google.cloud import firestore

# Updated default feed list
DEFAULT_FEEDS_CSV = """feed_url,category
https://auto.economictimes.indiatimes.com/rss/topstories,news
https://auto.economictimes.indiatimes.com/rss/recentstories,news
https://auto.economictimes.indiatimes.com/rss/auto-technology,news
https://auto.economictimes.indiatimes.com/rss/passenger-vehicle,news
https://auto.economictimes.indiatimes.com/rss/passenger-vehicle/uv,news
https://auto.economictimes.indiatimes.com/rss/passenger-vehicle/cars,news
https://auto.economictimes.indiatimes.com/rss/two-wheelers,news
https://auto.economictimes.indiatimes.com/rss/auto-components,news
https://auto.economictimes.indiatimes.com/rss/latest-stories,news
https://auto.economictimes.indiatimes.com/rss/tyres,news
https://auto.economictimes.indiatimes.com/rss/industry,news
https://auto.economictimes.indiatimes.com/rss/oil-and-lubes,news
https://auto.economictimes.indiatimes.com/rss/commercial-vehicle,news
https://auto.economictimes.indiatimes.com/rss/commercial-vehicle/mhcv,news
https://auto.economictimes.indiatimes.com/rss/commercial-vehicle/lcv,news
https://auto.economictimes.indiatimes.com/rss/aftermarket,news
https://auto.economictimes.indiatimes.com/rss/auto-finance,news
https://auto.economictimes.indiatimes.com/rss/automotive,news
https://auto.economictimes.indiatimes.com/rss/automotive/off-highway,news
https://auto.economictimes.indiatimes.com/rss/automotive/construction-equipment,news
https://auto.economictimes.indiatimes.com/rss/automotive/farm-equipment,news
https://auto.economictimes.indiatimes.com/rss/raw-material,news
https://www.automotive-iq.com/rss/articles,news
https://www.automotive-iq.com/rss/case-studies,news
https://www.automotive-iq.com/rss/news,news
https://www.automotive-iq.com/rss/reports,news
https://www.automotive-iq.com/rss/webinars,news
https://www.autocarpro.in/rssfeeds/all,news
https://auto.hindustantimes.com/rss/trending,news
https://auto.hindustantimes.com/rss/latest-news,news
https://auto.hindustantimes.com/rss/auto,news
https://automotive.einnews.com/all_rss#,news
https://www.tyremarket.com/tyremantra/rss,news
https://nsearchives.nseindia.com/content/RSS/Online_announcements.xml,press
https://nsearchives.nseindia.com/content/RSS/Annual_Reports.xml,filing
https://nsearchives.nseindia.com/content/RSS/Board_Meetings.xml,filing
https://nsearchives.nseindia.com/content/RSS/brsr.xml,filing
https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml,filing
https://nsearchives.nseindia.com/content/RSS/Corporate_Governance.xml,filing
https://nsearchives.nseindia.com/content/RSS/Daily_Buyback.xml,filing
https://nsearchives.nseindia.com/content/RSS/Financial_Results.xml,filing
https://nsearchives.nseindia.com/content/RSS/Insider_Trading.xml,filing
https://nsearchives.nseindia.com/content/RSS/Investor_Complaints.xml,filing
https://nsearchives.nseindia.com/content/RSS/Offer_Documents.xml,filing
https://nsearchives.nseindia.com/content/RSS/Related_Party_Trans.xml,filing
https://nsearchives.nseindia.com/content/RSS/Sast_Regulation29.xml,filing
https://nsearchives.nseindia.com/content/RSS/Sast_Regulation31.xml,filing
https://nsearchives.nseindia.com/content/RSS/Sast_ReasonForEncumbrance.xml,filing
https://nsearchives.nseindia.com/content/RSS/Secretarial_Compliance.xml,filing
https://nsearchives.nseindia.com/content/RSS/Share_Transfers.xml,filing
https://nsearchives.nseindia.com/content/RSS/Shareholding_Pattern.xml,filing
https://nsearchives.nseindia.com/content/RSS/Statement_Of_Deviation.xml,filing
https://nsearchives.nseindia.com/content/RSS/Unitholding_Patterns.xml,filing
https://nsearchives.nseindia.com/content/RSS/Voting_Results.xml,filing
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=APOLLOTYRES&type=10&dateb=&owner=exclude&count=40&search_text=,filing
https://feeds.finance.yahoo.com/rss/2.0/headline?s=APOLLOTYRES,news
https://seekingalpha.com/api/v3/newsfeed?symbols=APOLLOTYRES&until=0,news
https://feeds.marketwatch.com/marketwatch/daily/apollotyres,news
https://news.google.com/rss/search?q=Apollo%20Tyres&hl=en-US&gl=US&ceid=US:en,news
https://www.reuters.com/finance/stocks/APOLLOTYRES/news,news
https://stocktwits.com/api/feeds/APOLLOTYRES,news
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=INDAGINGROUP&type=10&dateb=&owner=exclude&count=40&search_text=,filing
https://feeds.finance.yahoo.com/rss/2.0/headline?s=INDAGINGROUP,news
https://seekingalpha.com/api/v3/newsfeed?symbols=INDAGINGROUP&until=0,news
https://feeds.marketwatch.com/marketwatch/daily/indagingroup,news
https://news.google.com/rss/search?q=Indag&hl=en-US&gl=US&ceid=US:en,news
https://www.reuters.com/finance/stocks/INDAGINGROUP/news,news
https://stocktwits.com/api/feeds/INDAGINGROUP,news
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=CEAT&type=10&dateb=&owner=exclude&count=40&search_text=,filing
https://feeds.finance.yahoo.com/rss/2.0/headline?s=CEAT,news
https://seekingalpha.com/api/v3/newsfeed?symbols=CEAT&until=0,news
https://feeds.marketwatch.com/marketwatch/daily/ceat,news
https://news.google.com/rss/search?q=CEAT&hl=en-US&gl=US&ceid=US:en,news
https://www.reuters.com/finance/stocks/CEAT/news,news
https://stocktwits.com/api/feeds/CEAT,news
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=JKTYRE&type=10&dateb=&owner=exclude&count=40&search_text=,filing
https://feeds.finance.yahoo.com/rss/2.0/headline?s=JKTYRE,news
https://seekingalpha.com/api/v3/newsfeed?symbols=JKTYRE&until=0,news
https://feeds.marketwatch.com/marketwatch/daily/jktyre,news
https://news.google.com/rss/search?q=JK%20Tyre&hl=en-US&gl=US&ceid=US:en,news
https://www.reuters.com/finance/stocks/JKTYRE/news,news
https://stocktwits.com/api/feeds/JKTYRE,news
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MIDASTOUCH&type=10&dateb=&owner=exclude&count=40&search_text=,filing
https://feeds.finance.yahoo.com/rss/2.0/headline?s=MIDASTOUCH,news
https://seekingalpha.com/api/v3/newsfeed?symbols=MIDASTOUCH&until=0,news
https://feeds.marketwatch.com/marketwatch/daily/midastouch,news
https://news.google.com/rss/search?q=Midas&hl=en-US&gl=US&ceid=US:en,news
https://www.reuters.com/finance/stocks/MIDASTOUCH/news,news
https://stocktwits.com/api/feeds/MIDASTOUCH,news
"""


def parse_feeds_csv(csv_text: str) -> list[dict]:
    """Parse CSV and return list of feed dicts."""
    lines = csv_text.strip().split("\n")
    reader = csv.DictReader(lines)
    feeds = []
    for row in reader:
        if not row or not row.get("feed_url"):
            continue
        feeds.append({
            "url": row["feed_url"].strip(),
            "category": row.get("category", "news").strip().lower(),
            "enabled": True,
        })
    return feeds


def seed_user_feeds(user_id: str, project: str = "trackr-adyo-20260406") -> int:
    """Seed default feeds for a user. Returns count loaded."""
    client = firestore.Client(project=project)
    user_ref = client.collection("users").document(user_id)
    
    feeds = parse_feeds_csv(DEFAULT_FEEDS_CSV)
    sources = [
        {
            "id": f"{i:012x}",
            "url": feed["url"],
            "label": feed["url"].split("//")[-1].split("/")[0],
            "enabled": feed["enabled"],
            "category": feed["category"],
        }
        for i, feed in enumerate(feeds)
    ]
    
    user_ref.set(
        {"feed_sources": {"sources": sources}},
        merge=True,
    )
    print(f"✓ Seeded {len(sources)} feeds for user {user_id}")
    return len(sources)


def main():
    parser = argparse.ArgumentParser(description="Seed feed sources.")
    parser.add_argument("--user", help="Seed feeds for this user ID")
    parser.add_argument("--wipe-all", action="store_true", help="Wipe all users and reseed")
    
    args = parser.parse_args()
    
    if args.user:
        seed_user_feeds(args.user)
    elif args.wipe_all:
        client = firestore.Client(project="trackr-adyo-20260406")
        users = list(client.collection("users").stream())
        print(f"Wiping and reseeding {len(users)} users...")
        for doc in users:
            seed_user_feeds(doc.id)
        print("Done!")
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
