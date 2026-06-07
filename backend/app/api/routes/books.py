from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.book import BookCreate, BookResponse
from app.services.book_service import get_all_books, get_book_by_id, create_book, get_top_rated_books
from typing import List

router = APIRouter()

@router.get("/", response_model=List[BookResponse])
def list_books(db: Session = Depends(get_db)):
    return get_all_books(db)

@router.get("/top-rated", response_model=List[BookResponse])
def top_rated_books(db: Session = Depends(get_db)):
    return get_top_rated_books(db)

@router.get("/{book_id}", response_model=BookResponse)
def get_single_book(book_id: int, db: Session = Depends(get_db)):
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Knjiga nije pronađena")
    return book

@router.post("/", response_model=BookResponse)
def add_book(payload: BookCreate, db: Session = Depends(get_db)):
    return create_book(db, payload.model_dump())