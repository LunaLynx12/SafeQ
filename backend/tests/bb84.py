from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
import random
import os
import json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from typing import Dict, List, Optional

app = FastAPI()

# Store session keys per WebSocket connection
session_keys: Dict[WebSocket, bytes] = {}

# =======================
# BB84 LOGIC
# =======================

def generate_random_bits(n):
    return [random.randint(0, 1) for _ in range(n)]

def generate_random_bases(n):
    return [random.choice(['+', 'x']) for _ in range(n)]

def encode_photons(bits, bases):
    return list(zip(bits, bases))

def measure_photons(encoded_photons, bob_bases):
    measured_bits = []
    for (bit, alice_base), bob_base in zip(encoded_photons, bob_bases):
        if alice_base == bob_base:
            measured_bits.append(bit)
        else:
            measured_bits.append(random.randint(0, 1))
    return measured_bits

def sift_key(alice_bases, bob_bases, alice_bits, bob_bits):
    key = []
    for ab, bb, abit, bbit in zip(alice_bases, bob_bases, alice_bits, bob_bits):
        if ab == bb:
            key.append(abit)
    return key

def bb84_simulation(n=256):
    alice_bits = generate_random_bits(n)
    alice_bases = generate_random_bases(n)
    encoded_photons = encode_photons(alice_bits, alice_bases)
    bob_bases = generate_random_bases(n)
    bob_bits = measure_photons(encoded_photons, bob_bases)
    shared_key_bits = sift_key(alice_bases, bob_bases, alice_bits, bob_bits)

    print("\n--- BB84 Simulation Results ---")
    print(f"Alice's Bits (first 32): {alice_bits[:32]}")
    print(f"Alice's Bases (first 32): {alice_bases[:32]}")
    print(f"Bob's Bases (first 32): {bob_bases[:32]}")
    print(f"Bob's Measured Bits (first 32): {bob_bits[:32]}")
    print(f"Sifted Key Bits (first 32): {shared_key_bits[:32]}")

    return {
        "alice_bits": alice_bits,
        "alice_bases": alice_bases,
        "bob_bases": bob_bases,
        "bob_bits": bob_bits,
        "shared_key_bits": shared_key_bits,
    }

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
# WEBSOCKET ENDPOINT
# =======================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "init":
                print("Running BB84...")
                result = bb84_simulation()
                shared_key_bits = result["shared_key_bits"]
                key_bytes = bb84_key_to_bytes(shared_key_bits)
                session_keys[websocket] = key_bytes

                # Send back the BB84 result so client can verify or log
                await websocket.send_json({
                    "status": "bb84_complete",
                    "key_length": len(shared_key_bits),
                    "message": "Shared key established."
                })

            elif message.get("type") == "message":
                if websocket not in session_keys:
                    await websocket.send_json({"error": "No shared key available"})
                    continue

                key = session_keys[websocket]
                ciphertext_hex = message.get("ciphertext")
                if not ciphertext_hex:
                    await websocket.send_json({"error": "No ciphertext provided"})
                    continue

                ciphertext = bytes.fromhex(ciphertext_hex)
                plaintext = decrypt_message(ciphertext, key)

                print(f"\n--- Decrypted Message ---")
                print(f"Ciphertext (hex): {ciphertext_hex[:32]}... ({len(ciphertext)} bytes)")
                print(f"Plaintext: {plaintext}")

                # Echo back the decrypted message
                await websocket.send_json({
                    "plaintext": plaintext
                })

    except WebSocketDisconnect:
        print("Client disconnected")
        if websocket in session_keys:
            del session_keys[websocket]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("bb84:app", host="127.0.0.1", port=4001, reload=False)
