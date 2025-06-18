from fastapi import APIRouter


router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/")
async def helloworld():
    return "Hello, world"