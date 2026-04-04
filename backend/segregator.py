def segregate_articles_by_keywords(articles, keywords):
    result = {k: [] for k in keywords}

    for article in articles:
        title = (article.get("title") or "").lower()
        summary = (article.get("summary") or "").lower()
        for keyword in keywords:
            key_lc = keyword.lower()
            if key_lc in title or key_lc in summary:
                result[keyword].append(article)
    
    return result
