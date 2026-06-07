from sqlalchemy import Column, Integer, String, Text, Float
from app.core.database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    categories = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)
    pages = Column(Integer, nullable=True)