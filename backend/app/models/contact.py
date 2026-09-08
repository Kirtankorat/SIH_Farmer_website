from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(150), nullable=False)
    role_type = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="unread") # unread, replied, archived
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
