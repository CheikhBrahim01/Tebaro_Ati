# main.py
from fastapi import FastAPI, HTTPException
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from typing import List

app = FastAPI()

conf = ConnectionConfig(
    MAIL_USERNAME="cheikhbay635@gmail.com",
    MAIL_PASSWORD="votre_mot_de_passe_application",
    MAIL_FROM="cheikhbay635@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailSchema(BaseModel):
    email: List[EmailStr]
    subject: str
    body: str

class GoalReachedSchema(BaseModel):
    beneficiary_email: EmailStr
    project_name: str
    collected_amount: float

@app.post("/send-email/")
async def send_email(email: EmailSchema):
    """
    Route générique pour envoyer un email. 
    On fournit le sujet, le body et la liste de destinataires.
    """
    message = MessageSchema(
        subject=email.subject,
        recipients=email.email,
        body=email.body,
        subtype="html"
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return {"message": "Email has been sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/notify-goal-reached/")
async def notify_goal_reached(payload: GoalReachedSchema):
    """
    Route pour informer l’utilisateur que son projet a atteint son objectif.
    """
    subject = f"Félicitations! Votre projet '{payload.project_name}' a atteint son objectif."
    
    body = f"""
    <h2>Votre projet a atteint son objectif!</h2>
    <p>Félicitations, votre projet <strong>{payload.project_name}</strong> 
       a atteint (ou dépassé) son objectif de financement.</p>
    <p>Montant collecté : <strong>${payload.collected_amount}</strong></p>
    <p>Vous pouvez dès maintenant retirer vos fonds sur la plateforme Tebaro_ati.</p>
    <p>Merci d'avoir utilisé notre service,</p>
    <p><em>L'équipe Tebaro_ati</em></p>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[payload.beneficiary_email],
        body=body,
        subtype="html"
    )
    
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return {"message": f"Goal reached email sent to {payload.beneficiary_email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
