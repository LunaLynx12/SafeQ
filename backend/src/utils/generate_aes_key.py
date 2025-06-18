import secrets
import base64


def generate_aes_key(key_length: int = 32) -> bytes:
    """
    Generates a cryptographically secure random key of the specified length (in bytes).
    
    :param key_length: Length of the key in bytes. Default is 32 (AES-256).
    :return: A randomly generated key as bytes.
    """
    return secrets.token_bytes(key_length)


def encode_key_to_base64(key: bytes) -> str:
    """
    Encodes a key from bytes to Base64 string for easy storage/transmission.
    
    :param key: The key in bytes.
    :return: Base64-encoded string.
    """
    return base64.b64encode(key).decode("utf-8")


def decode_key_from_base64(encoded_key: str) -> bytes:
    """
    Decodes a Base64 string back into bytes.
    
    :param encoded_key: The Base64-encoded key.
    :return: The decoded key as bytes.
    """
    return base64.b64decode(encoded_key)


def main():
    # Generate a new 256-bit (32-byte) AES key
    key = generate_aes_key()
    encoded_key = encode_key_to_base64(key)

    print(f"🔐 Generated AES Key (Base64): {encoded_key}")
    print(f"🔑 Raw Key (Hex): {key.hex()}\n")

    # Optional: Save to file
    with open("aes_key.txt", "w") as f:
        f.write(encoded_key)
    print("✅ Key saved to 'aes_key.txt'")


if __name__ == "__main__":
    main()