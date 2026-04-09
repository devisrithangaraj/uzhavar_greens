from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def create_default_admin():
    db = SessionLocal()
    admin = db.query(User).filter_by(email="admin@gmail.com").first()
    if not admin:
        hashed_password = pwd_context.hash("Admin1234@")
        db.add(User(
            name="Admin",
            email="admin@gmail.com",
            phone="6543234567",
            hashed_password=hashed_password,
            role="admin"
        ))
        db.commit()
    db.close()
