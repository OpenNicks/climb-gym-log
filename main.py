"""
main.py

Entry point for the Climb Gym Log FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import gyms, auth, users, comments
from app import models  # Ensures models are registered for SQLModel

app = FastAPI(title="Climb Gym Log")

# Allow all origins for development; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gyms.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(comments.router)

@app.get("/")
def read_root():
    """
    Root endpoint for health check.

    Returns:
        dict: Welcome message.
    """
    return {"message": "Welcome to Climb Gym Log API!"}
