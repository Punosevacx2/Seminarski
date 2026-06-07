from pydantic import BaseModel
from typing import Optional

class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[str] = None
    rating: Optional[float] = None
    pages: Optional[int] = None

class BookResponse(BookCreate):
    id: int

    class Config:
        from_attributes = True