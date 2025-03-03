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
