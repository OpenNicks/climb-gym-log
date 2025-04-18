"""
Entry point for the Climb Gym Log FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import gyms, auth, ascents
from app import models  # Ensures models are registered for SQLModel
from app.db import init_db

app = FastAPI()

# Ensure all tables are created at startup
init_db()

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
app.include_router(ascents.router)

@app.get("/")
def root():
    return {"message": "Climb Gym Log API is running."}
