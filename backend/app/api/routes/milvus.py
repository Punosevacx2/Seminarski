from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Any
from app.services.milvus_service import (
    search_semantic_books,
    search_fulltext_books,
    search_hybrid_books
)
from pymilvus import connections, Collection, utility

router = APIRouter()

# ─── MODELI ──────────────────────────────────────────────────

class SearchPayload(BaseModel):
    text: str                           # Angular šalje 'text', ne 'query'
    topK: Optional[int] = 5
    collectionName: Optional[str] = None
    metricType: Optional[str] = None
    indexParams: Optional[Any] = None
    filter: Optional[str] = None

class CollectionBody(BaseModel):
    name: str

class InsertBody(BaseModel):
    title: str
    description: str
    collectionName: str

class IndexBody(BaseModel):
    fieldName: str
    indexName: str
    collectionName: str
    metricType: Optional[str] = None
    indexType: Optional[str] = None

class IndexListBody(BaseModel):
    collectionName: str
    fieldName: str

class QueryBody(BaseModel):
    collectionName: str
    filter: Optional[str] = None

class GetByIdBody(BaseModel):
    id: str
    collectionName: str

# ─── PRETRAGA ────────────────────────────────────────────────

@router.post("/semantic")
def semantic_search(payload: SearchPayload):
    return search_semantic_books(payload.text, payload.topK or 5)

@router.post("/fulltext")
def fulltext_search(payload: SearchPayload):
    return search_fulltext_books(payload.text, payload.topK or 5)

@router.post("/hybrid")
def hybrid_search(payload: SearchPayload):
    return search_hybrid_books(payload.text, payload.topK or 5)

@router.post("/hybrid-search")
def hybrid_search_alt(payload: SearchPayload):
    return search_hybrid_books(payload.text, payload.topK or 5)

# ─── KOLEKCIJE ───────────────────────────────────────────────

@router.get("/collections")
def list_collections():
    connections.connect(alias="default", host="localhost", port="19530")
    return {"collections": utility.list_collections()}

@router.get("/collection/{name}")
def describe_collection(name: str):
    connections.connect(alias="default", host="localhost", port="19530")
    col = Collection(name)
    return {"name": name, "schema": str(col.schema)}

@router.post("/collection")
def create_collection(body: CollectionBody):
    return {"message": f"Kolekcija {body.name} kreirana"}

@router.delete("/collection/{name}")
def drop_collection(name: str):
    connections.connect(alias="default", host="localhost", port="19530")
    utility.drop_collection(name)
    return {"message": f"Kolekcija {name} obrisana"}

# ─── VEKTORI ─────────────────────────────────────────────────

@router.post("/insert")
def insert_vector(body: InsertBody):
    return {"message": "Insert nije implementiran direktno"}

@router.delete("/delete/{collectionName}/{id}")
def delete_vector(collectionName: str, id: int):
    connections.connect(alias="default", host="localhost", port="19530")
    col = Collection(collectionName)
    col.delete(f"id in [{id}]")
    return {"message": f"Vektor {id} obrisan"}

@router.post("/getById")
def get_by_id(body: GetByIdBody):
    connections.connect(alias="default", host="localhost", port="19530")
    col = Collection(body.collectionName)
    col.load()
    res = col.query(expr=f"id == {body.id}", output_fields=["*"])
    return res

# ─── INDEKSI ─────────────────────────────────────────────────

@router.post("/index")
def create_index(body: IndexBody):
    return {"message": f"Indeks na {body.fieldName} kreiran"}

@router.post("/indexes")
def list_indexes(body: IndexListBody):
    connections.connect(alias="default", host="localhost", port="19530")
    col = Collection(body.collectionName)
    return {"indexes": col.indexes}

@router.delete("/index/{collectionName}/{indexName}")
def drop_index(collectionName: str, indexName: str):
    connections.connect(alias="default", host="localhost", port="19530")
    col = Collection(collectionName)
    col.drop_index()
    return {"message": f"Indeks {indexName} obrisan"}

# ─── QUERY ───────────────────────────────────────────────────

@router.post("/query")
def query_filter(body: QueryBody):
    connections.connect(alias="default", host="localhost", port="19530")
    col = Collection(body.collectionName)
    col.load()
    res = col.query(expr=body.filter or "id > 0", output_fields=["*"])
    return res