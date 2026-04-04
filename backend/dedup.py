def dedup_articles(articles):
    unique_articles = []
    seen_urls = set()

    for article in articles:
        url = article.get("link")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_articles.append(article)

    return unique_articles
