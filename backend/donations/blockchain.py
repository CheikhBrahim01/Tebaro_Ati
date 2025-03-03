import json
from web3 import Web3
import os
import time

# Connexion à Ganache
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))

if not web3.is_connected():
    raise Exception("Impossible de se connecter à Ganache")

# Construire le chemin absolu vers le fichier JSON contenant l'ABI
current_dir = os.path.dirname(__file__)
contract_path = os.path.join(current_dir, 'blockchain_data', 'DonationTracker.json')

# Charger l'ABI du smart contract
with open(contract_path) as f:
    contract_data = json.load(f)
abi = contract_data

# Remplacez par l'adresse obtenue lors du déploiement sur Ganache via Remix
contract_address = "0xB34B810bea513aF85a883d7D05AE4F10e7E7BbC5"  
contract = web3.eth.contract(address=contract_address, abi=abi)

def record_donation_on_chain(donor_address, amount):
    # Remplacez cette clé par une clé privée valide issue de Ganache
    private_key = "0x04957a632d34f6f0c79fec79d32fcac3263fe6229e830af822166753e0d63f08"
    account = web3.eth.account.from_key(private_key)
    
    nonce = web3.eth.get_transaction_count(account.address)
    # Assurez-vous que le nom de la fonction dans le contrat est exactement "recordDonation"
    txn = contract.functions.recordDonation(amount).build_transaction({
        'chainId': 1337,  # Vérifiez le chainId dans Ganache (souvent 1337 ou 5777)
        'gas': 200000,
        'gasPrice': web3.to_wei('20', 'gwei'),
        'nonce': nonce,
    })
    signed_txn = account.sign_transaction(txn)
    txn_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
    txn_receipt = web3.eth.wait_for_transaction_receipt(txn_hash)
    return txn_receipt.transactionHash.hex()


if web3.is_connected():
    print("Connexion réussie à Ganache!")
    print("Chain ID:", web3.eth.chain_id)
else:
    print("Connexion échouée à Ganache.")
