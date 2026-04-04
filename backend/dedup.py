def dedup_articles(articles):
    unique_articles = []

    for article in articles:
        url = article.get("link")
        if url and url not in unique_articles:
            unique_articles.append(article)

    return unique_articles
