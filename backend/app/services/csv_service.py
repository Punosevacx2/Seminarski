import pandas as pd
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent  / "books_dataset.csv"

def load_books():
    df = pd.read_csv(DATA_PATH)
    df = df.fillna("")
    return df