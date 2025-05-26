from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from datetime import datetime
import base64

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace with your actual credentials
consumer_key = 'RMcavyQ3HidjPJb3N5i1fDCXGgIGmmFROuXS8GCKaOY6SLEs'
consumer_secret = '4EcHHsM8vFRCUOYLRc9oFk8Lgr32VuHu9K8iRlCFiYqxyW3oMpH5WXAyQuh768JW'
shortcode = '174379'
passkey = 'YOUR_PASSKEY'
callback_url = 'https://mydomain.com/callback'  # Optional, can be mocked

class PaymentRequest(BaseModel):
    phone: str
    amount: int

@app.post("/stkpush")
def stk_push(req: PaymentRequest):
    # Generate access token
    auth = (consumer_key, consumer_secret)
    headers = {"Content-Type": "application/json"}
    response = requests.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", auth=auth)
    access_token = response.json().get("access_token")

    # Prepare STK Push request
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

    stk_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": req.amount,
        "PartyA": req.phone,
        "PartyB": shortcode,
        "PhoneNumber": req.phone,
        "CallBackURL": callback_url,
        "AccountReference": "EssyTel",
        "TransactionDesc": "Payment to EssyTel"
    }

    stk_response = requests.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", json=payload, headers=stk_headers)

    return {"message": "STK Push Initiated", "safaricom_response": stk_response.json()}