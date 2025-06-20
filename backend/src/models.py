from tortoise.models import Model
from tortoise import fields


class Account(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=100, unique=True)
    password_hash = fields.CharField(max_length=128)
    kyber_public_key = fields.BinaryField(null=True)  # Store public key
    kyber_private_key_enc = fields.BinaryField(null=True)  # Encrypted private key
    kyber_salt = fields.BinaryField(null=True)  # Salt for key derivation
    dilithium_private_key = fields.BinaryField(null=True)  # or whatever type suits your key
    dilithium_public_key = fields.BinaryField(null=True)
    dilithium_salt = fields.BinaryField(null=True)

    def __str__(self):
        return self.username


class Message(Model):
    id = fields.IntField(pk=True)
    sender_id = fields.ForeignKeyField("models.Account", related_name="sent_messages")
    receiver_id = fields.ForeignKeyField("models.Account", related_name="received_messages")
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return f"From {self.sender_id} to {self.receiver_id}: {self.content[:20]}"
    

def write_message(sender: Account, receiver: Account, content: str):
    """
    Utility function to create and save a message.
    """
    message = Message(sender_id=sender, receiver_id=receiver, content=content)
    return message.save()


class File(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    path = fields.CharField(max_length=1024)
    owner = fields.ForeignKeyField("models.Account", related_name="files")
    size = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    is_starred = fields.BooleanField(default=False)
    is_shared = fields.BooleanField(default=False)
    mime_type = fields.CharField(max_length=100, default="")
    version = fields.IntField(default=1)
    encryption_status = fields.CharField(
        max_length=20,
        default="unencrypted",
        choices=["unencrypted", "encrypted", "processing"]
    )
    quantum_key_id = fields.CharField(max_length=36, null=True)
    ai_suggestions = fields.JSONField(default=list)
    share_links = fields.JSONField(default=list)
    encryption_key_ciphertext = fields.BinaryField(null=True)  # Stores Kyber-encrypted file key
    nonce = fields.BinaryField(null=True)  # For AES-GCM
    tag = fields.BinaryField(null=True)  # For AES-GCM
    content_signature = fields.BinaryField(null=True)  # Stores signature of encrypted content
    metadata_signature = fields.BinaryField(null=True)  # Stores signature of file metadata
    content_hash = fields.CharField(max_length=64, null=True)  # SHA-256 hash

    def __str__(self):
        return f"{self.name} ({self.size} bytes)"


class Folder(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    path = fields.CharField(max_length=1024)
    owner = fields.ForeignKeyField("models.Account", related_name="folders")
    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.path})"