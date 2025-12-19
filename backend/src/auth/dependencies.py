from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.models.user import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter_by(id=user_id).one_or_none()
    if not user:
        # stale cookie -> clear it
        request.session.pop("user_id", None)
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user

