from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from app.models.conversation import Conversation
from app.models.conversation_member import ConversationMember
from app.models.message import Message
from app.models.user import User


def get_or_create_conversation(
    db: Session,
    user_id: int,
    other_user_id: int,
) -> Conversation:
    if user_id == other_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create a conversation with yourself",
        )

    member = aliased(ConversationMember)
    other_member = aliased(ConversationMember)

    existing_conversation = (
        db.query(Conversation)
        .join(member, member.conversation_id == Conversation.id)
        .join(other_member, other_member.conversation_id == Conversation.id)
        .filter(member.user_id == user_id)
        .filter(other_member.user_id == other_user_id)
        .first()
    )

    if existing_conversation:
        return existing_conversation

    conversation = Conversation()
    db.add(conversation)
    db.flush()

    db.add_all(
        [
            ConversationMember(
                conversation_id=conversation.id,
                user_id=user_id,
            ),
            ConversationMember(
                conversation_id=conversation.id,
                user_id=other_user_id,
            ),
        ]
    )
    db.commit()
    db.refresh(conversation)

    return conversation


def get_user_conversations(db: Session, user_id: int) -> list[dict]:
    conversations = (
        db.query(Conversation)
        .join(ConversationMember)
        .filter(ConversationMember.user_id == user_id)
        .all()
    )

    conversation_summaries = []

    for conversation in conversations:
        other_user = (
            db.query(User)
            .join(ConversationMember, ConversationMember.user_id == User.id)
            .filter(ConversationMember.conversation_id == conversation.id)
            .filter(User.id != user_id)
            .first()
        )

        last_message = (
            db.query(Message)
            .filter(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .first()
        )

        unread_count = (
            db.query(func.count(Message.id))
            .filter(Message.conversation_id == conversation.id)
            .filter(Message.sender_id != user_id)
            .filter(Message.is_read == False)
            .scalar()
        )

        conversation_summaries.append(
            {
                "id": conversation.id,
                "other_user": other_user,
                "last_message": last_message.content if last_message else None,
                "last_message_at": last_message.created_at if last_message else None,
                "unread_count": unread_count or 0,
            }
        )

    return sorted(
        conversation_summaries,
        key=lambda summary: (
            summary["last_message_at"] is not None,
            summary["last_message_at"] or datetime.min,
        ),
        reverse=True,
    )
