from fastapi import APIRouter, Depends, HTTPException, UploadFile,File, Form, Request, Response
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from app.models import User
from app.database import get_db
from passlib.context import CryptContext
import os
from app import models,schemas
import shutil
import uuid
from fastapi import Security
from datetime import date
from app.config import get_required_env
from .auth import bearer_scheme, create_access_token, get_token_from_request, set_auth_cookie

router = APIRouter(tags=["admin"], prefix="/admin")
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

SECRET_KEY = get_required_env("SECRET_KEY")
ALGORITHM = "HS256"
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def save_product_image(image: UploadFile, base_dir: str) -> str:
    ext = os.path.splitext(image.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are allowed")

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image content type")

    image.file.seek(0, os.SEEK_END)
    size = image.file.tell()
    image.file.seek(0)
    if size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be smaller than 5 MB")

    filename = f"{uuid.uuid4()}{ext}"
    image_dir = os.path.join(base_dir, "static", "images")
    os.makedirs(image_dir, exist_ok=True)
    path = os.path.join(image_dir, filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return f"static/images/{filename}"


def get_current_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    token = get_token_from_request(request, credentials)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if not user or getattr(user, "role", "") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized as admin")
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")








@router.post("/login")
def admin_login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    token = create_access_token({"sub": user.email, "role": user.role})
    set_auth_cookie(response, token)
    return {"role": user.role}


# 🔹 Admin creates a product (JSON)
@router.post("/products", response_model=schemas.ProductResponse)
def create_product_api(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db_product = models.Product(
        name=product.name,
        price=product.price,
        grams=product.grams,
        description=product.description,
        image=product.image  # Can later be replaced with file upload path
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.post("/products/upload", response_model=schemas.ProductResponse)
def create_product_with_file(
    name: str = Form(...),
    price: float = Form(...),
    grams: float = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    # Save uploaded image
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    image_path = save_product_image(image, BASE_DIR)

    # Create product with relative image path
    db_product = models.Product(
        name=name,
        price=price,
        grams=grams,
        description=description,
        image=image_path
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products", response_model=list[schemas.ProductResponse])
def get_admin_products(
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_admin)
):
    query = db.query(models.Product)
    if q:
        query = query.filter(models.Product.name.ilike(f"%{q.strip()}%"))
    return query.all()






@router.put("/products/{product_id}/upload", response_model=schemas.ProductResponse)
def update_product_with_file(
    product_id: int,
    name: str = Form(...),
    price: float = Form(...),
    grams: float = Form(...),
    description: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = name
    product.price = price
    product.grams = grams
    product.description = description

    if image:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        product.image = save_product_image(image, base_dir)

    db.commit()
    db.refresh(product)
    return product




@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_admin)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}


@router.get("/orders", response_model=list[schemas.OrderResponse])
def get_admin_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.user), joinedload(models.Order.product))
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.put("/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin),
):
    valid_status = {"New", "Processing", "Shipped", "Completed"}
    status = payload.status.strip().title()
    if status not in valid_status:
        raise HTTPException(status_code=400, detail="Invalid status value")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    db.refresh(order)
    return order


@router.get("/feedback", response_model=list[schemas.FeedbackResponse])
def get_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin),
):
    return db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).all()


@router.put("/feedback/{feedback_id}/feature", response_model=schemas.FeedbackResponse)
def toggle_feedback_featured(
    feedback_id: int,
    payload: schemas.FeedbackFeatureUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin),
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback.featured = payload.featured
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin),
):
    today = date.today()
    month_start = today.replace(day=1)

    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    todays_orders = (
        db.query(func.count(models.Order.id))
        .filter(func.date(models.Order.created_at) == today)
        .scalar()
        or 0
    )
    completed_orders = (
        db.query(func.count(models.Order.id))
        .filter(models.Order.status == "Completed")
        .scalar()
        or 0
    )
    total_income = (
        db.query(func.coalesce(func.sum(models.Order.total_price), 0))
        .filter(models.Order.status == "Completed")
        .scalar()
        or 0
    )

    month_rows = (
        db.query(
            func.extract("day", models.Order.created_at).label("day"),
            func.count(models.Order.id).label("count"),
        )
        .filter(models.Order.created_at >= month_start)
        .group_by(func.extract("day", models.Order.created_at))
        .order_by(func.extract("day", models.Order.created_at))
        .all()
    )
    monthly_orders = [{"day": int(row.day), "count": int(row.count)} for row in month_rows]

    return {
        "total_products": int(total_products),
        "total_orders": int(total_orders),
        "todays_orders": int(todays_orders),
        "completed_orders": int(completed_orders),
        "total_income": float(total_income),
        "monthly_orders": monthly_orders,
    }

# # 🔹 Optional: Admin creates product with image upload
# @router.post("/products/upload", response_model=schemas.ProductResponse)
# def create_product_with_file(
#     name: str = Form(...),
#     price: float = Form(...),
#     grams: float = Form(...),
#     description: str = Form(...),
#     image: UploadFile = UploadFile(...),
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_admin)
# ):
#     # Save uploaded image
#     ext = os.path.splitext(image.filename)[1]
#     filename = f"{uuid.uuid4()}{ext}"
#     path = f"static/images/{filename}"
#     os.makedirs("static/images", exist_ok=True)
#     with open(path, "wb") as buffer:
#         shutil.copyfileobj(image.file, buffer)

#     db_product = models.Product(
#         name=name,
#         price=price,
#         grams=grams,
#         description=description,
#         image=path  # store file path
#     )
#     db.add(db_product)
#     db.commit()
#     db.refresh(db_product)
#     return db_product
