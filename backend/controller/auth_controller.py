import requests
import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

# Load variables from .env into the environment
load_dotenv()
API_KEY = os.getenv("API_KEY1")
API_KEYS = [os.getenv("API_KEY1"), os.getenv("API_KEY2"), os.getenv("API_KEY2")]
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")


auth_router = APIRouter(prefix="/v1/auth", tags=["auth"])

class GoogleAuth(BaseModel):
    code: str

@auth_router.post("/google/auth")
async def auth_google(payload: GoogleAuth):
    received_code = payload.code
    token_url = "https://accounts.google.com/o/oauth2/token"
    data = {
        "code": received_code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": "http://localhost:3000/callback",
        "grant_type": "authorization_code",
    }
    response = requests.post(token_url, data=data)
    access_token = response.json().get("access_token")
    
    return {
        "token": access_token,
    }

async def get_token_authorization(authorization: str = Header(...)):
    if authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1]
        return token
    raise HTTPException(status_code=401, detail="Invalid authorization header")

@auth_router.get("/google/user-data")
async def auth_google(token: str = Depends(get_token_authorization)):
    user_info = requests.get("https://www.googleapis.com/oauth2/v1/userinfo", headers={"Authorization": f"Bearer {token}"})
    return {
        "user_data": user_info.json()
    }