from app.db.base import Base
from app.db.session import engine
from app.models import conversation, conversation_member, message, user


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
