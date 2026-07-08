from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conversation_member import ConversationMember
from app.models.message import Message


def get_conversation_messages(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> list[Message]:
    membership = (
        db.query(ConversationMember)
        .filter(ConversationMember.conversation_id == conversation_id)
        .filter(ConversationMember.user_id == user_id)
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this conversation",
        )

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
