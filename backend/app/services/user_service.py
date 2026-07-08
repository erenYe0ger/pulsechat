from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def update_user_name(db: Session, user: User, new_name: str) -> User:
    user.name = new_name
    db.commit()
    db.refresh(user)

    return user


def search_users(db: Session, query: str, current_user_id: int) -> list[User]:
    return (
        db.query(User)
        .filter(User.name.ilike(f"%{query}%"))
        .filter(User.id != current_user_id)
        .limit(20)
        .all()
    )
