from Crypto.Cipher import AES
import os

# AES-GCM standard recommends a 12-byte nonce
NONCE_SIZE = 12
TAG_SIZE = 16

# Mock key (32 bytes for AES-256)
TEST_KEY_BYTES = os.urandom(32)

def aes_encrypt(key: bytes, plaintext: str, associated_data: bytes = b"header") -> bytes:
    """
    Encrypts a plaintext string using AES-GCM with a shared key.
    Returns: nonce (12B) + tag (16B) + ciphertext
    """
    nonce = os.urandom(NONCE_SIZE)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    cipher.update(associated_data)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
    return nonce + tag + ciphertext


def aes_decrypt(key: bytes, data: bytes, associated_data: bytes = b"header") -> str:
    """
    Decrypts an AES-GCM encrypted message using the shared key.
    Expected input: nonce (12B) + tag (16B) + ciphertext
    """
    nonce = data[:NONCE_SIZE]
    tag = data[NONCE_SIZE:NONCE_SIZE+TAG_SIZE]
    ciphertext = data[NONCE_SIZE+TAG_SIZE:]

    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    cipher.update(associated_data)

    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext.decode()
