from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserResponse


class ConversationCreate(BaseModel):
    other_user_id: int


class ConversationResponse(BaseModel):
    id: int
    other_user: UserResponse
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int

    class Config:
        from_attributes = True
