from sqlalchemy.orm import Session
from app.models.book import Book

def get_all_books(db: Session):
    return db.query(Book).all()

def get_book_by_id(db: Session, book_id: int):
    return db.query(Book).filter(Book.id == book_id).first()

def create_book(db: Session, data: dict):
    book = Book(**data)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

def get_top_rated_books(db: Session, limit: int = 10):
    return db.query(Book).order_by(Book.rating.desc()).limit(limit).all()