#!/usr/bin/env python3
"""
Generate RSS feed URLs from multiple sources for given companies.
Usage: python generate_feeds.py "Apollo Tyres" "Indag" "CEAT" "JK Tyre" > feeds_to_upload.csv
"""

import csv
import sys
from urllib.parse import quote


def generate_feeds_for_company(company_name, ticker=None):
    """Generate RSS feed URLs from various sources for a company."""
    feeds = []
    
    # Clean up name for use in URLs
    clean_name = company_name.strip()
    ticker_symbol = ticker or clean_name.split()[0].upper()  # Use first word as fallback ticker
    
    # SEC Edgar RSS (US companies - if ticker exists)
    if ticker:
        feeds.append({
            "url": f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={ticker}&type=10&dateb=&owner=exclude&count=40&search_text=",
            "category": "filing",
            "source": "SEC Edgar"
        })
    
    # Yahoo Finance - company news
    feeds.append({
        "url": f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker_symbol}",
        "category": "news",
        "source": "Yahoo Finance"
    })
    
    # Seeking Alpha - company page RSS
    feeds.append({
        "url": f"https://seekingalpha.com/api/v3/newsfeed?symbols={ticker_symbol}&until=0",
        "category": "news",
        "source": "Seeking Alpha"
    })
    
    # MarketWatch - company news
    feeds.append({
        "url": f"https://feeds.marketwatch.com/marketwatch/daily/{ticker_symbol.lower()}",
        "category": "news",
        "source": "MarketWatch"
    })
    
    # Google News - search for company
    feeds.append({
        "url": f"https://news.google.com/rss/search?q={quote(clean_name)}&hl=en-US&gl=US&ceid=US:en",
        "category": "news",
        "source": "Google News"
    })
    
    # Reuters - company news (if structured feed exists)
    feeds.append({
        "url": f"https://www.reuters.com/finance/stocks/{ticker_symbol}/news",
        "category": "news",
        "source": "Reuters"
    })
    
    # Stocktwits - symbol feed
    feeds.append({
        "url": f"https://stocktwits.com/api/feeds/{ticker_symbol}",
        "category": "news",
        "source": "Stocktwits"
    })
    
    return feeds


def main():
    """
    Main function. Takes company names/tickers as arguments.
    Example: python generate_feeds.py "Apollo Tyres" "Indag" "CEAT:CEAT" "JK Tyre:JK"
    Format: "Company Name" or "Company Name:TICKER" for custom ticker
    """
    
    if len(sys.argv) < 2:
        print("Usage: python generate_feeds.py 'Company1' 'Company2:TICKER' 'Company3'")
        print("Example: python generate_feeds.py 'Apollo Tyres' 'Indag' 'CEAT:CEAT' > feeds.csv")
        sys.exit(1)
    
    companies = sys.argv[1:]
    all_feeds = []
    
    for item in companies:
        if ":" in item:
            company_name, ticker = item.split(":", 1)
            company_name = company_name.strip()
            ticker = ticker.strip().upper()
        else:
            company_name = item.strip()
            ticker = None
        
        feeds = generate_feeds_for_company(company_name, ticker)
        all_feeds.extend(feeds)
    
    # Write CSV
    writer = csv.writer(sys.stdout)
    writer.writerow(["feed_url", "category"])
    
    for feed in all_feeds:
        writer.writerow([feed["url"], feed["category"]])


if __name__ == "__main__":
    main()
