from fastapi import APIRouter
import random
from typing import Dict, List

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/bb84")
async def bb84_protocol():
    num_photons = 10  # Number of photons sent by Alice

    # Step 1: Alice chooses random bits and bases
    alice_bits = [random.randint(0, 1) for _ in range(num_photons)]
    alice_bases = [random.choice(['Z', 'X']) for _ in range(num_photons)]

    # Step 2: Encode bits into photon states
    encoded_photons = []
    for bit, basis in zip(alice_bits, alice_bases):
        if basis == 'Z':
            photon_state = 'H' if bit == 0 else 'V'
        elif basis == 'X':
            photon_state = '+' if bit == 0 else 'x'
        encoded_photons.append(photon_state)

    # Step 3: Bob chooses random measurement bases
    bob_bases = [random.choice(['Z', 'X']) for _ in range(num_photons)]

    # Step 4: Bob measures the photons based on his basis
    bob_results = []
    for photon, b_basis in zip(encoded_photons, bob_bases):
        if b_basis == 'Z':
            # If basis is Z, measure H/V
            if photon in ['H', 'V']:
                measured_bit = 0 if photon == 'H' else 1
            else:
                # Mismatched basis → result is random
                measured_bit = random.randint(0, 1)
        elif b_basis == 'X':
            # If basis is X, measure +/x
            if photon in ['+', 'x']:
                measured_bit = 0 if photon == '+' else 1
            else:
                # Mismatched basis → result is random
                measured_bit = random.randint(0, 1)
        bob_results.append(measured_bit)

    # Step 5: Compare bases and keep only matching ones
    final_key = []
    for i in range(num_photons):
        if alice_bases[i] == bob_bases[i]:
            final_key.append({
                "index": i,
                "alice_bit": alice_bits[i],
                "bob_result": bob_results[i]
            })

    return {
        "alice_bits": alice_bits,
        "alice_bases": alice_bases,
        "encoded_photons": encoded_photons,
        "bob_bases": bob_bases,
        "bob_results": bob_results,
        "final_key": final_key,
        "description": "BB84 protocol simulation completed."
    }