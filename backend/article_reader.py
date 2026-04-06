from __future__ import annotations

import re
from typing import Dict, List
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def _clean_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(value.split())


def _looks_like_article_line(line: str) -> bool:
    text = _clean_text(line)
    if len(text) < 50:
        return False

    lower = text.lower()
    if any(token in lower for token in ["utm_source=", "javascript:void", "login", "get app"]):
        return False

    if text.startswith("[") or text.startswith("*") or text.startswith("-") or text.startswith("•"):
        return False

    if "![" in text or "Image " in text:
        return False

    if text.count("[") + text.count("]") >= 2:
        return False

    # Drop markdown/image/link-heavy nav lines.
    if text.count("](") >= 1 and len(re.findall(r"[a-zA-Z]", text)) < 120:
        return False

    alpha_chars = sum(ch.isalpha() for ch in text)
    alpha_ratio = alpha_chars / max(len(text), 1)
    if alpha_ratio < 0.55:
        return False

    words = re.findall(r"[A-Za-z0-9']+", text)
    return len(words) >= 8


def _summarize_from_content(content: str, fallback: str = "") -> str:
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    for line in lines:
        if _looks_like_article_line(line):
            return line[:320]
    return _clean_text(fallback)[:320]


def _is_content_image(img, absolute_url: str) -> bool:
    lower_url = absolute_url.lower()
    if lower_url.endswith(".svg"):
        return False

    block_tokens = [
        "logo",
        "icon",
        "sprite",
        "avatar",
        "profile",
        "user",
        "placeholder",
        "qr",
        "share",
        "social",
        "author",
        "banner",
        "advert",
        "ads",
    ]
    if any(token in lower_url for token in block_tokens):
        return False

    class_text = " ".join(img.get("class", [])) if isinstance(img.get("class"), list) else str(img.get("class") or "")
    id_text = str(img.get("id") or "")
    alt_text = str(img.get("alt") or "")
    meta_text = f"{class_text} {id_text} {alt_text}".lower()
    if any(token in meta_text for token in block_tokens):
        return False

    width_attr = img.get("width")
    height_attr = img.get("height")
    try:
        if width_attr and int(str(width_attr)) < 120:
            return False
        if height_attr and int(str(height_attr)) < 120:
            return False
    except ValueError:
        pass

    for parent in img.parents:
        name = (getattr(parent, "name", "") or "").lower()
        if name in {"header", "nav", "footer", "aside"}:
            return False
        parent_classes = parent.get("class", []) if hasattr(parent, "get") else []
        parent_class_text = " ".join(parent_classes).lower() if isinstance(parent_classes, list) else str(parent_classes).lower()
        if any(token in parent_class_text for token in ["header", "nav", "menu", "footer", "sidebar", "author", "social", "share"]):
            return False

    return True


def _clean_reader_text(raw_text: str) -> str:
    if not raw_text:
        return ""

    lines = [line.strip() for line in raw_text.splitlines()]

    cleaned: List[str] = []
    for line in lines:
        if not line:
            continue

        if line.startswith(("Title:", "URL Source:", "Published Time:", "Markdown Content:")):
            continue

        # Remove markdown heading prefix but keep the text.
        line = re.sub(r"^#{1,6}\s*", "", line)

        if _looks_like_article_line(line):
            cleaned.append(line)

    # De-duplicate nearby repeated lines often present in scraped output.
    deduped: List[str] = []
    prev = None
    for line in cleaned:
        if line == prev:
            continue
        deduped.append(line)
        prev = line

    return "\n\n".join(deduped)


def _extract_from_html(html: str, base_url: str) -> Dict[str, object]:
    soup = BeautifulSoup(html, "html.parser")

    for node in soup.select("script,style,noscript,svg,iframe"):
        node.decompose()

    title = ""
    og_title = soup.select_one("meta[property='og:title']")
    if og_title and og_title.get("content"):
        title = _clean_text(og_title.get("content"))
    if not title and soup.title and soup.title.string:
        title = _clean_text(soup.title.string)

    summary = ""
    og_description = soup.select_one("meta[property='og:description']")
    meta_description = soup.select_one("meta[name='description']")
    if og_description and og_description.get("content"):
        summary = _clean_text(og_description.get("content"))
    elif meta_description and meta_description.get("content"):
        summary = _clean_text(meta_description.get("content"))

    # Use a broader root for text extraction, but keep image extraction strict.
    root = soup.select_one("article") or soup.select_one("main") or soup.body or soup
    paragraphs: List[str] = []
    for p in root.select("p"):
        text = _clean_text(p.get_text(" ", strip=True))
        if _looks_like_article_line(text):
            paragraphs.append(text)

    content = "\n\n".join(paragraphs)
    if not summary:
        summary = _summarize_from_content(content)

    # Strict image root: only trust article-body-like containers.
    image_root = (
        soup.select_one("article")
        or soup.select_one("[itemprop='articleBody']")
        or soup.select_one(".article-body")
        or soup.select_one(".story-body")
        or soup.select_one(".post-content")
        or soup.select_one(".entry-content")
    )

    images: List[str] = []
    seen = set()
    for img in image_root.select("img") if image_root else []:
        src = img.get("src") or img.get("data-src") or img.get("data-original")
        if not src:
            continue
        absolute = urljoin(base_url, src)
        if not _is_content_image(img, absolute):
            continue
        if absolute in seen:
            continue
        seen.add(absolute)
        images.append(absolute)
        if len(images) >= 8:
            break

    return {
        "title": title,
        "summary": summary,
        "content": content,
        "images": images,
    }


def _fetch_with_jina_reader(url: str) -> str:
    # r.jina.ai often returns readable article text for JS-heavy pages.
    response = requests.get(
        f"https://r.jina.ai/{url}",
        headers=REQUEST_HEADERS,
        timeout=20,
    )
    response.raise_for_status()
    return response.text.strip()


def fetch_article_content(url: str) -> Dict[str, object]:
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=15)
    response.raise_for_status()

    extracted = _extract_from_html(response.text, base_url=url)
    content = str(extracted.get("content") or "").strip()

    if len(content) >= 500:
        return {
            "url": url,
            "title": extracted.get("title") or "",
            "summary": extracted.get("summary") or "",
            "content": content,
            "images": extracted.get("images") or [],
            "mode": "direct",
        }

    try:
        reader_text = _fetch_with_jina_reader(url)
        if reader_text and len(reader_text) > len(content):
            cleaned_reader_text = _clean_reader_text(reader_text)
            final_content = cleaned_reader_text if cleaned_reader_text else reader_text
            return {
                "url": url,
                "title": extracted.get("title") or "",
                "summary": extracted.get("summary") or _summarize_from_content(final_content),
                "content": final_content,
                "images": extracted.get("images") or [],
                "mode": "reader-fallback",
            }
    except Exception:
        pass

    return {
        "url": url,
        "title": extracted.get("title") or "",
        "summary": extracted.get("summary") or "",
        "content": content,
        "images": extracted.get("images") or [],
        "mode": "direct",
    }
