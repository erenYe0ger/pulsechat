import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session, aliased

from app.core.security import decode_access_token
from app.core.ws_manager import manager
from app.db.session import SessionLocal
from app.models.conversation_member import ConversationMember
from app.models.user import User
from app.services.message_service import create_message, mark_messages_read

router = APIRouter()
logger = logging.getLogger(__name__)


def get_other_member_id(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> int | None:
    membership = (
        db.query(ConversationMember)
        .filter(ConversationMember.conversation_id == conversation_id)
        .filter(ConversationMember.user_id == user_id)
        .first()
    )

    if membership is None:
        return None

    other_member = (
        db.query(ConversationMember)
        .filter(ConversationMember.conversation_id == conversation_id)
        .filter(ConversationMember.user_id != user_id)
        .first()
    )

    return other_member.user_id if other_member else None


def get_conversation_partner_ids(db: Session, user_id: int) -> list[int]:
    member = aliased(ConversationMember)
    partner = aliased(ConversationMember)

    rows = (
        db.query(partner.user_id)
        .join(member, member.conversation_id == partner.conversation_id)
        .filter(member.user_id == user_id)
        .filter(partner.user_id != user_id)
        .distinct()
        .all()
    )

    return [row[0] for row in rows]


def get_conversation_partner_map(db: Session, user_id: int) -> dict[int, int]:
    member = aliased(ConversationMember)
    partner = aliased(ConversationMember)

    rows = (
        db.query(partner.conversation_id, partner.user_id)
        .join(member, member.conversation_id == partner.conversation_id)
        .filter(member.user_id == user_id)
        .filter(partner.user_id != user_id)
        .all()
    )

    return {conversation_id: partner_id for conversation_id, partner_id in rows}


async def notify_partners_status(
    db: Session,
    user_id: int,
    is_online: bool,
) -> None:
    for partner_id in get_conversation_partner_ids(db, user_id):
        if manager.is_online(partner_id):
            await manager.send_to_user(
                partner_id,
                {
                    "type": "status",
                    "user_id": user_id,
                    "is_online": is_online,
                },
            )


async def notify_self_of_online_partners(db: Session, user_id: int) -> None:
    for partner_id in get_conversation_partner_ids(db, user_id):
        if manager.is_online(partner_id):
            await manager.send_to_user(
                user_id,
                {
                    "type": "status",
                    "user_id": partner_id,
                    "is_online": True,
                },
            )


def serialize_message(message) -> dict:
    return {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "content": message.content,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat(),
    }


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    with SessionLocal() as db:
        payload = decode_access_token(token)
        if payload is None:
            await websocket.close(code=1008)
            return

        user_id = payload.get("sub")
        if user_id is None:
            await websocket.close(code=1008)
            return

        try:
            token_user_id = int(user_id)
        except ValueError:
            await websocket.close(code=1008)
            return

        user = db.query(User).filter(User.id == token_user_id).first()
        if user is None:
            await websocket.close(code=1008)
            return

        current_user_id = user.id
        conversation_partner_ids = get_conversation_partner_map(db, current_user_id)

    await manager.connect(current_user_id, websocket)
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == current_user_id).first()
        if user is not None:
            user.is_online = True
            db.commit()
        await notify_partners_status(db, current_user_id, True)
        await notify_self_of_online_partners(db, current_user_id)

    try:
        while True:
            try:
                data = await websocket.receive_json()
                message_type = data.get("type")

                if message_type == "message":
                    conversation_id = int(data["conversation_id"])
                    content = data["content"]

                    with SessionLocal() as db:
                        message = create_message(
                            db,
                            conversation_id,
                            current_user_id,
                            content,
                        )
                        other_user_id = get_other_member_id(
                            db,
                            conversation_id,
                            current_user_id,
                        )
                        if other_user_id is not None:
                            conversation_partner_ids[conversation_id] = other_user_id
                        outgoing_data = {
                            "type": "message",
                            "message": serialize_message(message),
                        }

                    await manager.send_to_user(current_user_id, outgoing_data)
                    if other_user_id is not None:
                        await manager.send_to_user(other_user_id, outgoing_data)

                elif message_type == "typing":
                    conversation_id = int(data["conversation_id"])
                    is_typing = bool(data["is_typing"])
                    other_user_id = conversation_partner_ids.get(conversation_id)

                    if other_user_id is not None:
                        await manager.send_to_user(
                            other_user_id,
                            {
                                "type": "typing",
                                "sender_id": current_user_id,
                                "conversation_id": conversation_id,
                                "is_typing": is_typing,
                            },
                        )

                elif message_type == "read":
                    conversation_id = int(data["conversation_id"])

                    with SessionLocal() as db:
                        other_user_id = get_other_member_id(
                            db,
                            conversation_id,
                            current_user_id,
                        )

                        if other_user_id is not None:
                            conversation_partner_ids[conversation_id] = other_user_id
                            message_ids = mark_messages_read(
                                db,
                                conversation_id,
                                current_user_id,
                            )

                    if other_user_id is not None:
                        await manager.send_to_user(
                            other_user_id,
                            {
                                "type": "read_receipt",
                                "conversation_id": conversation_id,
                                "message_ids": message_ids,
                            },
                        )
            except WebSocketDisconnect:
                raise
            except Exception:
                logger.exception("Error processing websocket message")
                continue
    finally:
        manager.disconnect(current_user_id)
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == current_user_id).first()
            if user is not None:
                user.is_online = False
                db.commit()
            await notify_partners_status(db, current_user_id, False)
