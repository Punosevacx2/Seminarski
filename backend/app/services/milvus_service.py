from app.services.embedding_service import get_embedding
from app.services.csv_service import load_books
import pandas as pd
import os
from dotenv import load_dotenv
from pymilvus import connections, Collection, CollectionSchema, FieldSchema, DataType, utility

load_dotenv()

MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
COLLECTION_NAME = "books"

def connect_milvus():
    connections.connect(alias="default", host=MILVUS_HOST, port=MILVUS_PORT)

def search_semantic_books(query: str, limit: int = 5):
    connect_milvus()
    collection = Collection(COLLECTION_NAME)
    collection.load()

    query_vector = get_embedding(query)

    results = collection.search(
        data=[query_vector],
        anns_field="vector",
        param={"metric_type": "COSINE", "params": {}},
        limit=limit,
        output_fields=["id", "title", "author", "description", "categories"]
    )

    output = []
    for hit in results[0]:
        entity = hit.entity
        output.append({
            "id": entity.get("id"),
            "title": entity.get("title"),
            "author": entity.get("author"),
            "description": entity.get("description"),
            "categories": entity.get("categories"),
            "semantic_score": float(hit.distance)
        })

    return output


def search_fulltext_books(query: str, limit: int = 5):
    df = load_books()

    query_lower = query.lower()

    def calc_score(row):
        score = 0
        for field in ["title", "author", "description", "categories"]:
            value = str(row.get(field, "")).lower()
            if query_lower in value:
                score += 3
            for word in query_lower.split():
                if word in value:
                    score += 1
        return score

    df["fulltext_score"] = df.apply(calc_score, axis=1)
    df = df[df["fulltext_score"] > 0]
    df = df.sort_values(by="fulltext_score", ascending=False).head(limit)

    return df.to_dict(orient="records")

def search_fulltext_books(query: str, limit: int = 5):
    df = load_books()

    query_lower = query.lower()

    def calc_score(row):
        score = 0
        for field in ["title", "authors", "description", "categories"]:  # authors umesto author
            value = str(row.get(field, "")).lower()
            if query_lower in value:
                score += 3
            for word in query_lower.split():
                if word in value:
                    score += 1
        return score

    df["fulltext_score"] = df.apply(calc_score, axis=1)
    df = df[df["fulltext_score"] > 0]
    df = df.sort_values(by="fulltext_score", ascending=False).head(limit)

    return df.to_dict(orient="records")


def search_hybrid_books(query: str, limit: int = 5):
    semantic_results = search_semantic_books(query, limit=20)
    fulltext_results = search_fulltext_books(query, limit=20)

    merged = {}

    for item in semantic_results:
        book_id = int(item["id"])
        merged[book_id] = {
            **item,
            "semantic_score": item.get("semantic_score", 0),
            "fulltext_score": 0
        }

    for item in fulltext_results:
        # CSV može imati isbn13 ili id kao primarni ključ
        raw_id = item.get("isbn13") or item.get("id")
        if raw_id is None:
            continue
        try:
            book_id = int(raw_id)
        except (ValueError, TypeError):
            continue

        if book_id in merged:
            merged[book_id]["fulltext_score"] = item.get("fulltext_score", 0)
        else:
            merged[book_id] = {
                "id": book_id,
                "title": item.get("title"),
                "author": item.get("authors") or item.get("author"),
                "description": item.get("description"),
                "categories": item.get("categories"),
                "semantic_score": 0,
                "fulltext_score": item.get("fulltext_score", 0)
            }

    results = list(merged.values())

    for item in results:
        item["hybrid_score"] = item["semantic_score"] + item["fulltext_score"]

    results.sort(key=lambda x: x["hybrid_score"], reverse=True)

    return results[:limit]

    for item in results:
        item["hybrid_score"] = item["semantic_score"] + item["fulltext_score"]

    results.sort(key=lambda x: x["hybrid_score"], reverse=True)

    return results[:limit]




def create_books_collection():
    connect_milvus()

    if utility.has_collection(COLLECTION_NAME):
        collection = Collection(COLLECTION_NAME)
        collection.load()
        return collection

    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="author", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="description", dtype=DataType.VARCHAR, max_length=8192),
        FieldSchema(name="categories", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=384),
    ]

    schema = CollectionSchema(fields, description="Books collection")
    collection = Collection(name=COLLECTION_NAME, schema=schema)

    collection.create_index(
        field_name="vector",
        index_params={
            "index_type": "AUTOINDEX",
            "metric_type": "COSINE",
            "params": {}
        }
    )

    collection.load()
    return collection