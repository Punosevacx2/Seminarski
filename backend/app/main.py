from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.books import router as books_router
from app.api.routes.milvus import router as milvus_router

app = FastAPI(title="Book Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books_router, prefix="/api/books", tags=["books"])
app.include_router(milvus_router, prefix="/api/milvus", tags=["milvus"])

@app.get("/")
def root():
    return {"message": "Backend radi"}

@app.get("/health")
def health():
    return {"status": "ok"}