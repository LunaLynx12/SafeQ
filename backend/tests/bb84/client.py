import requests
import random
import argparse
import time
from typing import Optional, Dict

SERVER_URL = "http://localhost:4000/quantum"
N_BITS = 256
MAX_RETRIES = 30  # Maximum number of retries for checking Bob's submission
RETRY_DELAY = 5   # Seconds to wait between retries

def generate_bits_and_bases(n: int) -> tuple[str, str]:
    bits = [random.choice(['0', '1']) for _ in range(n)]
    bases = [random.choice(['+', 'x']) for _ in range(n)]
    return ''.join(bits), ''.join(bases)

def generate_bases(n: int) -> str:
    return ''.join([random.choice(['+', 'x']) for _ in range(n)])

def safe_request(url: str, method: str = 'get', json_data: Optional[Dict] = None) -> Optional[Dict]:
    try:
        if method == 'post':
            response = requests.post(url, json=json_data)
        else:
            response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def wait_for_bob_submission() -> bool:
    print("Waiting for Bob to submit his bases...")
    for attempt in range(MAX_RETRIES):
        key_data = safe_request(f"{SERVER_URL}/generate_key")
        if key_data and "alice_bases" in key_data:  # Check for successful key generation
            return True
        time.sleep(RETRY_DELAY)
        print(f"Attempt {attempt + 1}/{MAX_RETRIES}: Bob not ready yet...")
    return False

def run_alice():
    bits, bases = generate_bits_and_bases(N_BITS)
    
    # Submit to server
    response = safe_request(f"{SERVER_URL}/alice/submit", 'post', {"bits": bits, "bases": bases})
    if not response:
        print("Failed to submit Alice's data")
        return
    
    print("Alice submission:", response)
    
    # Wait for Bob to submit
    if not wait_for_bob_submission():
        print("Error: Bob did not submit data in time")
        return
    
    # Get final key
    key_data = safe_request(f"{SERVER_URL}/generate_key")
    if not key_data:
        print("Failed to generate key")
        return
    
    print("\n=== Quantum Key Distribution Results ===")
    print("Alice's bases:", key_data.get("alice_bases", "N/A"))
    print("Bob's bases:  ", key_data.get("bob_bases", "N/A"))
    print("Measured bits:", key_data.get("measured_bits", "N/A"))
    print("Sifted key:   ", key_data.get("sifted_key", "N/A"))
    print("\nShared key (hex):", key_data.get("shared_key", "N/A"))

def run_bob():
    # Check if Alice has submitted data
    for attempt in range(MAX_RETRIES):
        check_data = safe_request(f"{SERVER_URL}/check_alice")
        if check_data and check_data.get("alice_ready"):
            break
        time.sleep(RETRY_DELAY)
        print(f"Attempt {attempt + 1}/{MAX_RETRIES}: Alice not ready yet...")
    else:
        print("Error: Alice didn't submit data in time")
        return

    bases = generate_bases(N_BITS)
    
    # Submit to server
    response = safe_request(f"{SERVER_URL}/bob/submit", 'post', {"bases": bases})
    if not response:
        print("Failed to submit Bob's data")
        return
    
    print("Bob submission:", response)
    
    # Get final key
    key_data = safe_request(f"{SERVER_URL}/generate_key")
    if not key_data:
        print("Failed to generate key")
        return
    
    print("\n=== Quantum Key Distribution Results ===")
    print("Alice's bases:", key_data.get("alice_bases", "N/A"))
    print("Bob's bases:  ", key_data.get("bob_bases", "N/A"))
    print("Measured bits:", key_data.get("measured_bits", "N/A"))
    print("Sifted key:   ", key_data.get("sifted_key", "N/A"))
    print("\nShared key (hex):", key_data.get("shared_key", "N/A"))

def main():
    parser = argparse.ArgumentParser(description="Quantum Key Distribution Client")
    parser.add_argument('role', choices=['alice', 'bob'], 
                      help="Run as Alice (initiator) or Bob (receiver)")
    
    args = parser.parse_args()
    
    if args.role == 'alice':
        print("Running as Alice (Initiator)")
        run_alice()
    else:
        print("Running as Bob (Receiver)")
        run_bob()

if __name__ == "__main__":
    main()