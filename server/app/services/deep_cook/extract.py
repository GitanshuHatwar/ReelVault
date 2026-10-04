from langchain_core.messages import HumanMessage, SystemMessage

from app.config import get_settings
from app.llm import get_llm
from app.schemas.domain import Extracted, FetchedPost
from app.services.deep_cook import prompts as P


def extract(post: FetchedPost) -> Extracted:
    llm = get_llm("main").with_structured_output(Extracted)
    system = P.EXTRACT_SYSTEM.replace("{tz}", get_settings().default_timezone)
    user = (
        f"posted_at: {post.posted_at.isoformat() if post.posted_at else 'unknown'}\n"
        + P.wrap("transcript", post.transcript)
        + "\n"
        + P.wrap("caption", post.caption)
    )
    return llm.invoke([SystemMessage(system), HumanMessage(user)])
