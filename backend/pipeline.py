from feed import *
from dedup import *
from segregator import *

master_articles = []

# Extracting the feeds from the CSV file.
feeds = fetch_feeds("feeds.csv")
print(f"fetched feed count: {len(feeds)}")


for i in feeds:
    articles = fetch_items(i)
    print(f"Feed: {i} -> {len(articles)}")
    master_articles.extend(articles)

print(f"master_articles count: {len(master_articles)}")

unique_articles = dedup_articles(master_articles)
print(f"unique_articles count: {len(unique_articles)}")

keys = ["Apollo", "Indag", "Midas", "JK", "CEAT"]
a=segregate_articles_by_keywords(unique_articles, keys)
for i in keys:
    print(f"{i} count: {len(a[i])}")
    print(a[i])




