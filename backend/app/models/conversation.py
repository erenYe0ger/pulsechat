from datetime import datetime

from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.orm import relationship

from app.db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship(
        "ConversationMember",
        back_populates="conversation",
    )
    messages = relationship(
        "Message",
        back_populates="conversation",
    )
