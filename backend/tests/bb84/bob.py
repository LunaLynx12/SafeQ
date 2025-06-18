import requests
import random

def generate_bases(n):
    return ''.join([random.choice(['+', 'x']) for _ in range(n)])

def main():
    # First check if Alice has submitted data
    try:
        check_response = requests.get("http://localhost:8000/check_alice")
        if not check_response.json().get("alice_ready"):
            print("Error: Alice hasn't submitted data yet")
            return
    except requests.exceptions.RequestException as e:
        print(f"Connection error: {e}")
        return

    # Generate matching number of bases (must match Alice's count)
    n = 256  # Should be the same as Alice's n
    bases = generate_bases(n)
    
    # Submit to server
    try:
        response = requests.post(
            "http://localhost:8000/bob/submit",
            json={"bases": bases}
        )
        print("Bob submission:", response.json())
        
        # Get the generated key
        key_response = requests.get("http://localhost:8000/generate_key")
        key_data = key_response.json()
        
        print("\nAlice's bases:", key_data["alice_bases"])
        print("Bob's bases:  ", key_data["bob_bases"])
        print("Measured bits:", key_data["measured_bits"])
        print("Sifted key:   ", key_data["sifted_key"])
        print("\nShared key (hex):", key_data["shared_key"])
    except requests.exceptions.RequestException as e:
        print(f"Error during submission: {e}")

if __name__ == "__main__":
    main()