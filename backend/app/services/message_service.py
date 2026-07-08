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


def create_message(
    db: Session,
    conversation_id: int,
    sender_id: int,
    content: str,
) -> Message:
    membership = (
        db.query(ConversationMember)
        .filter(ConversationMember.conversation_id == conversation_id)
        .filter(ConversationMember.user_id == sender_id)
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this conversation",
        )

    message = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def mark_messages_read(
    db: Session,
    conversation_id: int,
    reader_id: int,
) -> list[int]:
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .filter(Message.sender_id != reader_id)
        .filter(Message.is_read == False)
        .all()
    )
    message_ids = [message.id for message in messages]

    for message in messages:
        message.is_read = True

    db.commit()

    return message_ids
