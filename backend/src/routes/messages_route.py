from fastapi import APIRouter


router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/public_chat")
async def last_10_messages():
    return {
        "id": "10",
        "Message": "Dummy"
    }