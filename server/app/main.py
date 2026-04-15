from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_cors_origins
from .routes import admin, ai, auth, users
from app.database import SessionLocal
from app.models import User
from app.routes.admin import pwd_context

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://uzhavar-greens.netlify.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.on_event("startup")
def create_default_admin():
    db = SessionLocal()

    admin = db.query(User).filter(User.email == "admin@gmail.com").first()

    if not admin:
    new_admin = User(
        name="Admin",              # ✅ ADD THIS
        email="admin@gmail.com",
        phone="0000000000",       # ✅ OR valid dummy value
        hashed_password=pwd_context.hash("Admin@123"),
        role="admin"
    )

    db.add(new_admin)
    db.commit()

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(ai.router)
