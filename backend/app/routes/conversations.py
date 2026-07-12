from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.routes.deps import get_current_user
from app.schemas.conversation import ConversationCreate, ConversationResponse
from app.schemas.message import MessageResponse
from app.services.conversation_service import (
    get_conversation_detail,
    get_or_create_conversation,
    get_user_conversations,
)
from app.services.message_service import get_conversation_messages

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse)
def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = get_or_create_conversation(
        db,
        current_user.id,
        conversation_data.other_user_id,
    )

    return get_conversation_detail(db, conversation.id, current_user.id)



@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_conversations(db, current_user.id)


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
def list_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_conversation_messages(db, conversation_id, current_user.id)
