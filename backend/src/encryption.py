from Crypto.Cipher import AES
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
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

# Constants
NONCE_SIZE = 12
TAG_SIZE = 16

def aes_encrypt2(key: bytes, plaintext, associated_data: bytes = b"header") -> bytes:
    """
    Encrypts plaintext (str or bytes) using AES-GCM
    Returns: nonce (12B) + tag (16B) + ciphertext
    """
    # Convert plaintext to bytes if it's a string
    if isinstance(plaintext, str):
        plaintext = plaintext.encode()
    
    # Generate random nonce
    nonce = os.urandom(NONCE_SIZE)
    
    # Create cipher object
    cipher = Cipher(
        algorithms.AES(key),
        modes.GCM(nonce),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    # Add associated data (authenticated but not encrypted)
    encryptor.authenticate_additional_data(associated_data)
    
    # Encrypt and finalize
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    
    # Return nonce + tag + ciphertext
    return nonce + encryptor.tag + ciphertext

def aes_decrypt2(key: bytes, data: bytes, associated_data: bytes = b"header") -> bytes:
    """
    Decrypts AES-GCM encrypted data
    Expected input: nonce (12B) + tag (16B) + ciphertext
    Returns: decrypted bytes
    """
    # Split the input data
    nonce = data[:NONCE_SIZE]
    tag = data[NONCE_SIZE:NONCE_SIZE+TAG_SIZE]
    ciphertext = data[NONCE_SIZE+TAG_SIZE:]
    
    # Create cipher object
    cipher = Cipher(
        algorithms.AES(key),
        modes.GCM(nonce, tag),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    
    # Add associated data
    decryptor.authenticate_additional_data(associated_data)
    
    # Decrypt and verify
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext

def derive_key2(shared_secret: bytes, salt: bytes = None, info: bytes = b"") -> bytes:
    """
    Derive a secure key using HKDF
    """
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,  # 256-bit key for AES-256
        salt=salt,
        info=info,
        backend=default_backend()
    )
    return hkdf.derive(shared_secret)