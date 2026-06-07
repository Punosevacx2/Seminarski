from sentence_transformers import SentenceTransformer

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True,local_files_only=True )

def build_book_text(book: dict) -> str:
    return " ".join([
        str(book.get("title", "")),
        str(book.get("author", "")),
        str(book.get("categories", "")),
        str(book.get("description", ""))
    ])

def get_embedding(text: str, task: str = "search_document") -> list[float]:
    return model.encode(f"{task}: {text}").tolist()