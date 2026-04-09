# app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, Security, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas
from app.database import get_db
from .auth import get_current_user  # correct relative import  # JWT-based dependency for users

router = APIRouter()

# -----------------------------
# 1️⃣ View all products
# -----------------------------
@router.get("/products", response_model=list[schemas.ProductResponse])
def view_products(
    q: str | None = Query(default=None, description="Search by product name"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)
    if q:
        query = query.filter(models.Product.name.ilike(f"%{q.strip()}%"))
    return query.all()

# -----------------------------
# 2️⃣ View a single product
# -----------------------------
@router.get("/products/{product_id}", response_model=schemas.ProductResponse)
def view_single_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# -----------------------------
# 3️⃣ Place an order
# -----------------------------
@router.post("/orders")
def place_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate total price based on grams
    total_price = product.price * (order.grams / product.grams)
    
    # Create order record
    db_order = models.Order(
        user_id=current_user.id,
        product_id=product.id,
        checkout_ref=order.checkout_ref,
        grams=order.grams,
        total_price=total_price,
        shipping_phone=order.shipping_phone.strip(),
        shipping_address=order.shipping_address.strip(),
        shipping_pincode=order.shipping_pincode.strip(),
        status="New",
        created_at=datetime.utcnow()
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return {
        "message": "Order created successfully!",
        "order_id": db_order.id,
        "product": product.name,
        "grams": order.grams,
        "total_price": total_price
    }

# -----------------------------
# 4️⃣ View user’s own orders
# -----------------------------
@router.get("/orders")
def view_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [
        schemas.UserOrderResponse(
            id=order.id,
            product_id=order.product_id,
            product_name=order.product.name if order.product else "Unknown",
            product_image=order.product.image if order.product else None,
            checkout_ref=order.checkout_ref,
            grams=order.grams,
            total_price=order.total_price,
            shipping_phone=order.shipping_phone,
            shipping_address=order.shipping_address,
            shipping_pincode=order.shipping_pincode,
            status=order.status,
            created_at=order.created_at,
            feedback=order.feedback,
        )
        for order in orders
    ]


@router.post("/feedback", response_model=schemas.FeedbackResponse)
def create_feedback(
    payload: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == payload.order_id,
            models.Order.user_id == current_user.id
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "Completed":
        raise HTTPException(status_code=400, detail="Feedback can be submitted only for completed orders")
    if order.feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this order")

    rating = max(1, min(payload.rating, 5))
    feedback = models.Feedback(
        user_id=current_user.id,
        order_id=order.id,
        message=payload.message.strip(),
        rating=rating,
        featured=False,
        created_at=datetime.utcnow(),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/feedback/featured", response_model=list[schemas.FeedbackResponse])
def view_featured_feedback(db: Session = Depends(get_db)):
    return (
        db.query(models.Feedback)
        .filter(models.Feedback.featured.is_(True))
        .order_by(models.Feedback.created_at.desc())
        .limit(6)
        .all()
    )


@router.delete("/feedback/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    feedback = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.id == feedback_id,
            models.Feedback.user_id == current_user.id
        )
        .first()
    )
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted"}
