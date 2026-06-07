# app/scripts/seed_milvus.py

import os
import pandas as pd
from dotenv import load_dotenv
from pymilvus import connections, Collection, CollectionSchema, FieldSchema, DataType, utility
from app.services.embedding_service import get_embedding

load_dotenv()

MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
COLLECTION_NAME = "books"
CSV_PATH = "app/services/books_dataset.csv"
BATCH_SIZE = 100  # ubacuje po 100 knjiga odjednom


def connect_milvus():
    connections.connect(alias="default", host=MILVUS_HOST, port=MILVUS_PORT)
    print(f"✅ Konekcija na Milvus: {MILVUS_HOST}:{MILVUS_PORT}")


def drop_collection_if_exists():
    if utility.has_collection(COLLECTION_NAME):
        utility.drop_collection(COLLECTION_NAME)
        print(f"🗑️  Stara kolekcija '{COLLECTION_NAME}' obrisana")


def create_collection():
    fields = [
        FieldSchema(name="id",          dtype=DataType.INT64,         is_primary=True, auto_id=False),
        FieldSchema(name="title",        dtype=DataType.VARCHAR,       max_length=512),
        FieldSchema(name="author",       dtype=DataType.VARCHAR,       max_length=512),
        FieldSchema(name="description",  dtype=DataType.VARCHAR,       max_length=8192),
        FieldSchema(name="categories",   dtype=DataType.VARCHAR,       max_length=1024),
        FieldSchema(name="thumbnail",    dtype=DataType.VARCHAR,       max_length=1024),
        FieldSchema(name="published_year", dtype=DataType.FLOAT),
        FieldSchema(name="average_rating", dtype=DataType.FLOAT),
        FieldSchema(name="num_pages",    dtype=DataType.FLOAT),
        FieldSchema(name="vector",       dtype=DataType.FLOAT_VECTOR,  dim=768),
    ]

    schema = CollectionSchema(fields, description="Books collection")
    collection = Collection(name=COLLECTION_NAME, schema=schema)
    print(f"✅ Kolekcija '{COLLECTION_NAME}' kreirana")

    collection.create_index(
        field_name="vector",
        index_params={
            "index_type": "AUTOINDEX",
            "metric_type": "COSINE",
            "params": {}
        }
    )
    print("✅ Indeks kreiran")
    return collection


def build_text_for_embedding(row: dict) -> str:
    """Kombinuje polja za bolji embedding."""
    parts = [
        str(row.get("title", "")),
        str(row.get("authors", "")),
        str(row.get("categories", "")),
        str(row.get("description", ""))[:500],  # prvih 500 znakova opisa
    ]
    return " | ".join(p for p in parts if p and p != "nan")


def clean_str(val, max_len=512) -> str:
    s = str(val) if val is not None else ""
    if s == "nan":
        s = ""
    return s[:max_len]


def clean_float(val) -> float:
    try:
        f = float(val)
        return f if f == f else 0.0  # NaN check
    except:
        return 0.0


def seed_milvus():
    connect_milvus()
    drop_collection_if_exists()
    collection = create_collection()

    print(f"\n📂 Učitavam CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"📊 Ukupno redova: {len(df)}")
    print(f"📋 Kolone: {list(df.columns)}\n")

    # ukloni redove bez isbn13
    df = df.dropna(subset=["isbn13"])
    df["isbn13"] = df["isbn13"].astype(str).str.strip()
    df = df[df["isbn13"].str.isnumeric()]
    print(f"📊 Validnih redova: {len(df)}\n")

    ids          = []
    titles       = []
    authors      = []
    descriptions = []
    categories   = []
    thumbnails   = []
    pub_years    = []
    avg_ratings  = []
    num_pages    = []
    vectors      = []

    total = len(df)
    inserted = 0
    skipped = 0

    for i, (_, row) in enumerate(df.iterrows()):
        try:
            book_id = int(row["isbn13"])
        except Exception:
            skipped += 1
            continue

        text = build_text_for_embedding(row.to_dict())

        try:
            vector = get_embedding(text)
        except Exception as e:
            print(f"⚠️  Embedding greška za '{row.get('title', '')}': {e}")
            skipped += 1
            continue

        ids.append(book_id)
        titles.append(clean_str(row.get("title", ""), 512))
        authors.append(clean_str(row.get("authors", ""), 512))
        descriptions.append(clean_str(row.get("description", ""), 8192))
        categories.append(clean_str(row.get("categories", ""), 1024))
        thumbnails.append(clean_str(row.get("thumbnail", ""), 1024))
        pub_years.append(clean_float(row.get("published_year")))
        avg_ratings.append(clean_float(row.get("average_rating")))
        num_pages.append(clean_float(row.get("num_pages")))
        vectors.append(vector)

        # ubaci batch
        if len(ids) >= BATCH_SIZE:
            collection.insert([
                ids, titles, authors, descriptions,
                categories, thumbnails, pub_years,
                avg_ratings, num_pages, vectors
            ])
            inserted += len(ids)
            print(f"  ✅ Ubačeno {inserted}/{total} knjiga...")
            ids=[];titles=[];authors=[];descriptions=[]
            categories=[];thumbnails=[];pub_years=[]
            avg_ratings=[];num_pages=[];vectors=[]

    # ubaci ostatak
    if ids:
        collection.insert([
            ids, titles, authors, descriptions,
            categories, thumbnails, pub_years,
            avg_ratings, num_pages, vectors
        ])
        inserted += len(ids)

    collection.flush()
    collection.load()

    print(f"\n🎉 Seed završen!")
    print(f"   ✅ Ubačeno: {inserted} knjiga")
    print(f"   ⚠️  Preskočeno: {skipped} redova")
    print(f"   📦 Ukupno u kolekciji: {collection.num_entities}")


if __name__ == "__main__":
    seed_milvus()