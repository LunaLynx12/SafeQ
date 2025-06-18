from tortoise.models import Model
from tortoise import fields


class Account(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=100, unique=True)
    password_hash = fields.CharField(max_length=128)

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