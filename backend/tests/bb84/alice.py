import requests
import random

def generate_bits_and_bases(n):
    bits = [random.choice(['0', '1']) for _ in range(n)]
    bases = [random.choice(['+', 'x']) for _ in range(n)]
    return ''.join(bits), ''.join(bases)

def main():
    n = 256  # Number of bits
    bits, bases = generate_bits_and_bases(n)
    
    # Submit to server
    response = requests.post(
        "http://localhost:8000/alice/submit",
        json={"bits": bits, "bases": bases}
    )
    print("Alice submission:", response.json())
    
    # Wait for Bob to submit and get key
    input("Press Enter after Bob has submitted his bases...")
    key_response = requests.get("http://localhost:8000/generate_key")
    key_data = key_response.json()
    
    print("\nAlice's bases:", key_data["alice_bases"])
    print("Bob's bases:  ", key_data["bob_bases"])
    print("Measured bits:", key_data["measured_bits"])
    print("Sifted key:   ", key_data["sifted_key"])
    print("\nShared key (hex):", key_data["shared_key"])

if __name__ == "__main__":
    main()