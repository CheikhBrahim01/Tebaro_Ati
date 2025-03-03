from fastapi import FastAPI, HTTPException
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from typing import List

app = FastAPI()

# Updated email configuration
conf = ConnectionConfig(
    MAIL_USERNAME="cheikhbay635@gmail.com",
    MAIL_PASSWORD="dtgs xpxv flfd vtaa",
    MAIL_FROM="cheikhbay635@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,      # Required field replacing MAIL_TLS
    MAIL_SSL_TLS=False,      # Required field replacing MAIL_SSL
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailSchema(BaseModel):
    email: List[EmailStr]
    subject: str
    body: str

@app.post("/send-email/")
async def send_email(email: EmailSchema):
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
