# donations/utils.py
import requests

def notify_goal_reached_via_fastapi(beneficiary_email, project_name, collected_amount):
    """
    Appelle le microservice FastAPI pour envoyer un email de notification
    indiquant que le projet a atteint ou dépassé son objectif.
    """
    url = "http://localhost:8001/notify-goal-reached/"  # Adaptez l'URL/port si nécessaire
    payload = {
        "beneficiary_email": beneficiary_email,
        "project_name": project_name,
        "collected_amount": collected_amount
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("Email de notification envoyé avec succès !")
    except Exception as e:
        # Vous pouvez logger l'erreur ou l'ignorer selon vos besoins
        print(f"Erreur lors de l'envoi de l'email : {e}")

# donations/utils.py
from .models import Transaction

def create_transaction(wallet, **kwargs):
    """
    Crée une transaction en récupérant le hash de la dernière transaction
    pour construire la chaîne de hachage.
    """
    # Récupérer la dernière transaction du portefeuille
    last_tx = wallet.transactions.order_by('-timestamp').first()
    prev_hash = last_tx.current_hash if last_tx else None

    # Créer la transaction en incluant prev_hash
    tx = Transaction.objects.create(wallet=wallet, prev_hash=prev_hash, **kwargs)
    return tx

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization

import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization

# Définissez le chemin relatif où se trouvent vos clés.
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization

# Définir le dossier où se trouvent vos clés
# Ici, on part du fichier utils.py, qui se trouve dans donations/
# On remonte d'un niveau, puis on entre dans "scripts"
KEYS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'scripts')

def sign_log(message):
    private_key_path = os.path.join(KEYS_DIR, "private_key.pem")
    with open(private_key_path, "rb") as key_file:
        private_key = serialization.load_pem_private_key(key_file.read(), password=None)
    
    signature = private_key.sign(
        message.encode(),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature.hex()

def verify_log_signature(message, signature_hex):
    public_key_path = os.path.join(KEYS_DIR, "public_key.pem")
    with open(public_key_path, "rb") as key_file:
        public_key = serialization.load_pem_public_key(key_file.read())
    
    signature = bytes.fromhex(signature_hex)
    
    try:
        public_key.verify(
            signature,
            message.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False


    
from .models import LogEntry

def save_log_entry(message):
    signature = sign_log(message)
    log_entry = LogEntry.objects.create(message=message, signature=signature)
    return log_entry



