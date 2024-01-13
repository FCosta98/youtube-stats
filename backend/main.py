from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controller import auth_controller, complete_history_controller, analytics_controller

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "https://accounts.google.com/o/oauth2/auth", "http://127.0.0.1:8000/v1/auth/google/auth", "http://localhost:3000/login"],
    allow_credentials=True,
    # allow_methods=["*"],
    # allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "HEAD", "OPTIONS"],
    allow_headers=["Content-Type", "Set-Cookie", "Access-Control-Allow-Headers", 'Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
)

app.include_router(auth_controller.auth_router)
app.include_router(complete_history_controller.complete_history_router)
app.include_router(analytics_controller.analytics_router)