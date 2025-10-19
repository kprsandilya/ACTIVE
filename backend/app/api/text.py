from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Request model
class TextInput(BaseModel):
    input: str

# Response model (optional but useful)
class TextResponse(BaseModel):
    reply: str

@router.post("/text", response_model=TextResponse)
async def handle_text(input_data: TextInput):
    user_input = input_data.input
    
    # TODO: Replace this with your AI/logic processing
    assistant_reply = f"Echo: {user_input}"  
    
    return {"reply": assistant_reply}
