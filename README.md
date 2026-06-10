# Sistem za preporuku knjiga

Seminarski rad iz predmeta Obrada prirodnih jezika.

Aplikacija omogucava pretragu knjiga pomocu semanticke pretrage, full-text pretrage i hibridne pretrage, koristeci vektorsku bazu podataka Milvus i sentence-transformer model za generisanje embedinga.

## Tehnologije

- **Backend:** FastAPI, SQLAlchemy, PyMilvus
- **Frontend:** Angular 20
- **Vektorska baza:** Milvus
- **Model za embedinge:** `nomic-ai/nomic-embed-text-v1.5`
- **Dataset:** `svastikkka/BOOK-RECOMMENDER-DATASET` (Hugging Face)

## Preuzimanje podataka

Dataset se preuzima sa Hugging Face platforme. Postoje dva nacina:

### Automatski (skriptom)

```bash
cd backend
python -m app.scripts.download_dataset
```

Skripta ce preuzeti fajl `books_with_emotions.csv` i sacuvati ga kao `books_dataset.csv`.

### Rucno

1. Poseti: [https://huggingface.co/datasets/svastikkka/BOOK-RECOMMENDER-DATASET](https://huggingface.co/datasets/svastikkka/BOOK-RECOMMENDER-DATASET)
2. Preuzmi fajl `data/books_with_emotions.csv`
3. Sacuvaj ga na putanju: `backend/app/services/books_dataset.csv`

## Pokretanje aplikacije

### Preduslovi

- Python 3.10+
- Node.js 18+
- Docker (za Milvus)

### 1. Pokretanje Milvus-a

```bash
docker run -d --name milvus-standalone \
  -p 19530:19530 \
  -p 9091:9091 \
  milvusdb/milvus:latest standalone
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Kreiraj `.env` fajl u `backend/` direktorijumu:

```env
DATABASE_URL=sqlite:///./books.db
MILVUS_HOST=localhost
MILVUS_PORT=19530
```

Preuzmi i sacuvaj model za embedinge (izvrsava se automatski pri prvom pokretanju ili rucno):

```bash
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('nomic-ai/nomic-embed-text-v1.5', trust_remote_code=True)"
```

Popuni Milvus kolekciju podacima iz CSV-a:

```bash
cd backend
python -m app.scripts.seed_milvus
```

Pokreni backend server:

```bash
uvicorn app.main:app --reload
```

Backend je dostupan na: `http://localhost:8000`

API dokumentacija: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend je dostupan na: `http://localhost:4200`

## Tipovi pretrage

| Tip pretrage | Opis |
|---|---|
| **Semanticka** | Pronalazi knjige po znacenju upita koristeci vektorsku slicnost (COSINE) |
| **Full-text** | Klasicna pretraga po kljucnim recima |
| **Hibridna** | Kombinacija semanticke i full-text pretrage |

## Struktura projekta

```
Seminarski/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI rute (books, milvus)
│   │   ├── core/             # Konfiguracija i baza podataka
│   │   ├── models/           # SQLAlchemy modeli
│   │   ├── schemas/          # Pydantic sheme
│   │   ├── scripts/          # Skripte za preuzimanje i punjenje podataka
│   │   └── services/         # Poslovna logika i embedding servis
│   └── requirements.txt
└── frontend/
    └── src/app/
        └── component/        # Angular komponente
```
