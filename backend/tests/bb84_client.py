import asyncio
import json
import random
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import websockets

# =======================
# BB84 LOGIC (Client Side)
# =======================

def generate_random_bits(n):
    return [random.randint(0, 1) for _ in range(n)]

def generate_random_bases(n):
    return [random.choice(['+', 'x']) for _ in range(n)]

def measure_photons(encoded_photons, bob_bases):
    measured_bits = []
    for (bit, alice_base), bob_base in zip(encoded_photons, bob_bases):
        if alice_base == bob_base:
            measured_bits.append(bit)
        else:
            measured_bits.append(random.randint(0, 1))
    return measured_bits

def sift_key(alice_bases, bob_bases, bob_bits):
    key = []
    for ab, bb, bbit in zip(alice_bases, bob_bases, bob_bits):
        if ab == bb:
            key.append(bbit)
    return key

# =======================
# AES ENCRYPTION LOGIC
# =======================

def bb84_key_to_bytes(key_bits, length_bytes=16):
    bit_str = ''.join(map(str, key_bits[:length_bytes * 8]))  # Use first 128 bits
    byte_chunks = [bit_str[i:i+8] for i in range(0, len(bit_str), 8)]
    return bytes([int(b, 2) for b in byte_chunks])

def encrypt_message(message: str, key_bytes: bytes):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key_bytes), modes.CFB(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(message.encode()) + encryptor.finalize()
    return iv + ciphertext

def decrypt_message(ciphertext: bytes, key_bytes: bytes):
    iv = ciphertext[:16]
    actual_ciphertext = ciphertext[16:]
    cipher = Cipher(algorithms.AES(key_bytes), modes.CFB(iv))
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(actual_ciphertext) + decryptor.finalize()
    return plaintext.decode()

# =======================
# WEBSOCKET CLIENT
# =======================

async def connect_and_chat():
    uri = "ws://127.0.0.1:4001/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to server")

        # Step 1: Run BB84 simulation on the client side
        print("\n--- Running BB84 Simulation ---")
        n = 256
        alice_bits = generate_random_bits(n)
        alice_bases = generate_random_bases(n)
        encoded_photons = list(zip(alice_bits, alice_bases))

        # Simulate Bob receiving photons and measuring them
        bob_bases = generate_random_bases(n)
        bob_bits = measure_photons(encoded_photons, bob_bases)
        shared_key_bits = sift_key(alice_bases, bob_bases, bob_bits)

        print(f"\nAlice's Bits (first 32): {alice_bits[:32]}")
        print(f"Alice's Bases (first 32): {alice_bases[:32]}")
        print(f"Bob's Bases (first 32): {bob_bases[:32]}")
        print(f"Bob's Measured Bits (first 32): {bob_bits[:32]}")
        print(f"Sifted Key Bits (first 32): {shared_key_bits[:32]}")

        # Convert to key bytes
        key_bytes = bb84_key_to_bytes(shared_key_bits)
        print(f"Shared Key (hex): {key_bytes.hex()}\n")

        # Send init message to trigger BB84 on server (optional)
        await websocket.send(json.dumps({"type": "init"}))
        response = await websocket.recv()
        print("Server:", response)

        # Wait for confirmation from server
        while True:
            response = await websocket.recv()
            data = json.loads(response)
            if data.get("status") == "bb84_complete":
                print("BB84 complete. Shared key established.")
                break

        # Step 2: Encrypt and send a message
        message = input("Enter message to send: ")
        encrypted = encrypt_message(message, key_bytes)
        print(f"Encrypted Message (hex): {encrypted.hex()}")

        await websocket.send(json.dumps({
            "type": "message",
            "ciphertext": encrypted.hex()
        }))

        # Step 3: Receive and decrypt response
        response = await websocket.recv()
        data = json.loads(response)
        decrypted = data.get("plaintext")
        print(f"Received from server: {decrypted}")

# =======================
# RUN CLIENT
# =======================

if __name__ == "__main__":
    asyncio.run(connect_and_chat())