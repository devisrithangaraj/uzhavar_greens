
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from .database import Base
from sqlalchemy.orm import relationship
from datetime import datetime  # Base comes from database.py

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    orders = relationship("Order", back_populates="user", cascade="all, delete")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    grams = Column(Float)
    description = Column(String)
    image = Column(String)
    orders = relationship("Order", back_populates="product", cascade="all, delete")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    checkout_ref = Column(String, nullable=False, index=True)
    grams = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    shipping_phone = Column(String, nullable=False)
    shipping_address = Column(String, nullable=False)
    shipping_pincode = Column(String, nullable=False)
    status = Column(String, nullable=False, default="New")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    feedback = relationship("Feedback", back_populates="order", uselist=False, cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, unique=True)
    message = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    featured = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
    order = relationship("Order", back_populates="feedback")
