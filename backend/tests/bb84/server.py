from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from qiskit import QuantumCircuit, Aer, execute
from typing import Dict
import secrets

app = FastAPI()

# Storage for client data
alice_data = {}
bob_data = {}

class PhotonData(BaseModel):
    bits: str
    bases: str

class BasisData(BaseModel):
    bases: str

@app.get("/check_alice")
async def check_alice():
    """Check if Alice has submitted data"""
    return {"alice_ready": bool(alice_data)}

@app.post("/alice/submit")
async def alice_submit(data: PhotonData):
    """Alice submits her initial bits and bases"""
    alice_data.clear()
    alice_data.update({
        "bits": data.bits,
        "bases": data.bases
    })
    return {"status": "Alice data received"}

@app.post("/bob/submit")
async def bob_submit(data: BasisData):
    """Bob submits his measurement bases"""
    if not alice_data:
        raise HTTPException(status_code=400, detail="Alice hasn't submitted data yet")
    
    if len(data.bases) != len(alice_data["bits"]):
        raise HTTPException(status_code=400, detail="Number of bases doesn't match Alice's bits")
    
    bob_data.clear()
    bob_data.update({
        "bases": data.bases,
        "alice_bits": alice_data["bits"],
        "alice_bases": alice_data["bases"]
    })
    return {"status": "Bob data received"}

@app.get("/generate_key")
async def generate_key():
    """Generate shared key after both parties submitted data"""
    if not alice_data or not bob_data:
        raise HTTPException(status_code=400, detail="Missing data from Alice or Bob")
    
    # Build quantum circuit
    n = len(bob_data["alice_bits"])
    qc = QuantumCircuit(n, n)
    
    # Encode Alice's bits
    for i in range(n):
        if bob_data["alice_bits"][i] == '1':
            qc.x(i)
        if bob_data["alice_bases"][i] == 'x':
            qc.h(i)
    
    # Apply Bob's measurement bases
    for i in range(n):
        if bob_data["bases"][i] == 'x':
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
        if bob_data["alice_bases"][i] == bob_data["bases"][i]
    ]
    
    # Convert to bytes (take first 128 bits)
    key_bytes = bytes([int(''.join(sifted_key[i:i+8]), 2) for i in range(0, 128, 8)])
    key_hex = key_bytes.hex()
    
    return {
        "alice_bases": bob_data["alice_bases"],
        "bob_bases": bob_data["bases"],
        "measured_bits": measured_bits,
        "sifted_key": ''.join(sifted_key),
        "shared_key": key_hex
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)