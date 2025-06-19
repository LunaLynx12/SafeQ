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

class ConversationUser(BaseModel):
    user_id: int
    username: str

class ConversationMessage(BaseModel):
    id: int
    content: str
    sender_name: str
    receiver_name: str
    created_at: datetime

class QuantumKeyData(BaseModel):
        generated_key_length: int
        shared_key: str
        alice_bits_sample: str
        alice_bases_sample: str
        bob_bases_sample: str
        matching_bases_count: int

class CombinedResponse(BaseModel):
    quantum_key_data: QuantumKeyData
    conversation_messages: list[ConversationMessage]


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

# @router.get("/conversations", response_model=List[ConversationUser])
# async def get_conversations(current_user: Account = Depends(get_current_user)):
#     user_id = current_user.id

#     # Găsește toate mesajele unde userul e sender sau receiver
#     messages = await Message.filter(
#         Q(sender_id=user_id) | Q(receiver_id=user_id)
#     ).all()

#     # Extrage ID-urile celorlalți utilizatori
#     other_user_ids = set()
#     for msg in messages:
#         if msg.sender_id_id != user_id:
#             other_user_ids.add(msg.sender_id_id)
#         if msg.receiver_id_id != user_id:
#             other_user_ids.add(msg.receiver_id_id)

#     # Obține conturile acestor utilizatori
#     users = await Account.filter(id__in=other_user_ids).all()

#     return [
#         ConversationUser(user_id=user.id, username=user.username)
#         for user in users
#     ]

@router.get("/conversations/{user_id}", response_model=List[ConversationUser])
async def get_conversations_by_user_id(user_id: int):
    # Verificăm dacă userul există
    user = await Account.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Găsim toate mesajele unde userul e implicat
    messages = await Message.filter(
        Q(sender_id=user_id) | Q(receiver_id=user_id)
    ).all()

    # Extragem ceilalți useri implicați în conversații
    other_user_ids = set()
    for msg in messages:
        if msg.sender_id_id != user_id:
            other_user_ids.add(msg.sender_id_id)
        if msg.receiver_id_id != user_id:
            other_user_ids.add(msg.receiver_id_id)

    # Îi aducem din baza de date
    users = await Account.filter(id__in=other_user_ids).all()

    return [
        ConversationUser(user_id=user.id, username=user.username)
        for user in users
    ]

@router.get("/conversation_with/{other_user_id}", response_model=CombinedResponse)
async def get_conversation_with_user(
    other_user_id: int,
    current_user: Account = Depends(get_current_user)
):
    # Verifică dacă celălalt utilizator există
    other_user = await Account.get_or_none(id=other_user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Găsește toate mesajele între current_user și other_user
    messages = await Message.filter(
        (Q(sender_id=current_user.id) & Q(receiver_id=other_user_id)) |
        (Q(sender_id=other_user_id) & Q(receiver_id=current_user.id))
    ).order_by("created_at").prefetch_related("sender_id", "receiver_id")

    import secrets
    from qiskit import QuantumCircuit, Aer, execute
    n = 128 * 2  # Generate extra bits to account for basis mismatches
    alice_bits = ''.join(secrets.choice('01') for _ in range(n))
    alice_bases = ''.join(secrets.choice('zx') for _ in range(n))  # z=computational, x=Hadamard
    
    # Generate random bases for Bob
    bob_bases = ''.join(secrets.choice('zx') for _ in range(n))
    
    # Build and simulate quantum circuit
    qc = QuantumCircuit(n, n)
    
    # Alice prepares her qubits
    for i in range(n):
        if alice_bits[i] == '1':
            qc.x(i)
        if alice_bases[i] == 'x':
            qc.h(i)
    
    # Bob measures
    for i in range(n):
        if bob_bases[i] == 'x':
            qc.h(i)
    
    qc.measure(range(n), range(n))
    
    # Simulate
    simulator = Aer.get_backend('qasm_simulator')
    result = execute(qc, simulator, shots=1).result()
    counts = result.get_counts(qc)
    measured_bits = list(counts.keys())[0][::-1]  # Reverse for Qiskit endianness
    
    # Sift key (keep bits where bases match)
    sifted_key = [
        measured_bits[i]
        for i in range(n)
        if alice_bases[i] == bob_bases[i]
    ]
    
    # Convert to bytes
    key_bytes = bytes([int(''.join(sifted_key[i:i+8]), 2) for i in range(0, len(sifted_key), 8)])
    key_hex = key_bytes.hex()

    print("Secred key generated:", key_hex)
    
    

    # Then in your endpoint:
    return CombinedResponse(
        quantum_key_data={
            "generated_key_length": len(sifted_key),
            "shared_key": key_hex,
            "alice_bits_sample": alice_bits,
            "alice_bases_sample": alice_bases,
            "bob_bases_sample": bob_bases,
            "matching_bases_count": len(sifted_key)
        },
        conversation_messages=[
            ConversationMessage(
                id=msg.id,
                content=msg.content,
                sender_name=msg.sender_id.username,
                receiver_name=msg.receiver_id.username,
                created_at=msg.created_at
            )
            for msg in messages
        ]
    )
