from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from tortoise.exceptions import DoesNotExist
from models import Account, Message, write_message
from utils.jwt import get_current_user
from datetime import datetime
from typing import List


router = APIRouter(prefix="/messages", tags=["Messages"])

# Request model for sending messages
class MessageRequest(BaseModel):
    receiver_id: int
    content: str

# Response model for message data
class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime

# Optional: Model for conversation list
class ConversationPreview(BaseModel):
    user_id: int
    username: str
    last_message: str
    timestamp: datetime


@router.post("/send_message_demo")
async def send_message_demo():
    # PROPERLY FETCH ACCOUNT OBJECTS
    sender = await Account.get(id=1)
    receiver = await Account.get(id=2)
    
    # Create the message directly
    new_message = await Message.create(
        sender_id=sender,
        receiver_id=receiver,
        content="test"
    )
    
    return {"message": "Message sent successfully", "message_id": new_message.id}


from fastapi import APIRouter, Depends, HTTPException
from tortoise.exceptions import DoesNotExist
from tortoise.expressions import Q
from models import Account, Message
from utils.jwt import get_current_user

# Create a router for messaging endpoints
router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/send_message", response_model=MessageResponse)
async def send_message(
    request: MessageRequest,
    current_user: Account = Depends(get_current_user)
):
    try:
        # Get receiver as Account object
        receiver = await Account.get(id=request.receiver_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Create message with Account objects
    new_message = await Message.create(
        sender_id=current_user,
        receiver_id=receiver,
        content=request.content
    )
    
    return MessageResponse(
        id=new_message.id,
        sender_id=current_user.id,
        receiver_id=receiver.id,
        content=new_message.content,
        created_at=new_message.created_at
    )

@router.get("/get_messages", response_model=List[MessageResponse])
async def get_messages(
    current_user: Account = Depends(get_current_user),
    limit: int = 100,
    offset: int = 0
):
    # Get all messages involving the current user
    messages = await Message.filter(
        Q(sender_id=current_user.id) | Q(receiver_id=current_user.id)
    ).order_by("-created_at").limit(limit).offset(offset)
    
    return [
        MessageResponse(
            id=msg.id,
            sender_id=msg.sender_id_id,  # Direct ID access without loading relation
            receiver_id=msg.receiver_id_id,
            content=msg.content,
            created_at=msg.created_at
        )
        for msg in messages
    ]

@router.get("/messages_with/{user_id}", response_model=List[MessageResponse])
async def get_messages_with_user(
    user_id: int,
    current_user: Account = Depends(get_current_user),
    limit: int = 100,
    offset: int = 0
):
    try:
        # Verify the other user exists
        await Account.get(id=user_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get conversation between two users
    messages = await Message.filter(
        (Q(sender_id=current_user.id) & Q(receiver_id=user_id)) |
        (Q(sender_id=user_id) & Q(receiver_id=current_user.id))
    ).order_by("-created_at").limit(limit).offset(offset)
    
    return [
        MessageResponse(
            id=msg.id,
            sender_id=msg.sender_id_id,
            receiver_id=msg.receiver_id_id,
            content=msg.content,
            created_at=msg.created_at
        )
        for msg in messages
    ]