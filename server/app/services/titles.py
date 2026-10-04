def reel_title(post: dict) -> str:
    """Best available title from SocialKit payload, caption, author, or transcript."""
    raw = post.get("raw") or {}
    data = raw.get("data") if isinstance(raw, dict) else {}
    if isinstance(data, dict):
        for key in ("title", "videoTitle", "video_title", "name"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    caption = (post.get("caption") or "").strip()
    if caption:
        first = caption.splitlines()[0].strip()
        if first:
            return first[:160]

    author = (post.get("author") or "").strip()
    if author:
        handle = author if author.startswith("@") else f"@{author}"
        return f"{handle} reel"

    transcript = (post.get("transcript") or "").strip()
    if transcript:
        first = transcript.split(".")[0].strip()
        return first[:160] if first else "Untitled reel"

    return "Untitled reel"
