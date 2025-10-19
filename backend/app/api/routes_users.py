from fastapi import APIRouter
from app.models.user import User

router = APIRouter()

@router.get("/") 
def list_users():
    return [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"}
    ]

@router.post("/")
def create_user(user: User):
    return {"message": f"User {user.name} created!"}
