from pydantic import BaseModel, EmailStr, ConfigDict, Field
from pydantic import field_validator
from typing import Optional
from datetime import datetime



class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

# Outgoing data (do not expose password)
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str

    model_config = ConfigDict(from_attributes=True)


class SessionUser(UserOut):
    role: str

class ProductCreate(BaseModel):
    name: str
    price: float
    grams: float
    description: str
    image: Optional[str] = None


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True   # IMPORTAN


class OrderCreate(BaseModel):
    product_id: int
    checkout_ref: str
    grams: float
    shipping_phone: str
    shipping_address: str
    shipping_pincode: str

    @field_validator("shipping_phone")
    @classmethod
    def validate_indian_phone(cls, value: str) -> str:
        phone = "".join(ch for ch in value if ch.isdigit())
        if len(phone) != 10 or phone[0] not in {"6", "7", "8", "9"}:
            raise ValueError("Enter a valid Indian 10-digit phone number")
        return phone

    @field_validator("shipping_pincode")
    @classmethod
    def validate_pincode(cls, value: str) -> str:
        pin = "".join(ch for ch in value if ch.isdigit())
        if len(pin) != 6:
            raise ValueError("Enter a valid 6-digit pincode")
        return pin

    @field_validator("shipping_address")
    @classmethod
    def validate_address(cls, value: str) -> str:
        if len(value.strip()) < 10:
            raise ValueError("Address is too short")
        return value.strip()


class OrderStatusUpdate(BaseModel):
    status: str

# Outgoing data / response schema
class OrderResponse(BaseModel):
    id: int
    user: Optional[UserOut] = None
    product: Optional[ProductResponse] = None
    checkout_ref: str
    grams: float
    total_price: float
    shipping_phone: str
    shipping_address: str
    shipping_pincode: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserOrderResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    checkout_ref: str
    grams: float
    total_price: float
    shipping_phone: str
    shipping_address: str
    shipping_pincode: str
    status: str
    created_at: datetime
    feedback: Optional["FeedbackResponse"] = None


class FeedbackCreate(BaseModel):
    order_id: int
    message: str
    rating: int


class FeedbackFeatureUpdate(BaseModel):
    featured: bool


class FeedbackResponse(BaseModel):
    id: int
    order_id: Optional[int] = None
    message: str
    rating: int
    featured: bool
    created_at: datetime
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class ChatHistoryItem(BaseModel):
    role: str
    text: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in {"user", "model"}:
            raise ValueError("Role must be either 'user' or 'model'")
        return value


class ChatRequest(BaseModel):
    message: str
    history: list[ChatHistoryItem] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError("Message cannot be empty")
        if len(text) > 1000:
            raise ValueError("Message is too long")
        return text


class ChatResponse(BaseModel):
    reply: str


UserOrderResponse.model_rebuild()
