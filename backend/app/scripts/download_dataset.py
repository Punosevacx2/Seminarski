from datasets import load_dataset
import pandas as pd

# učitaj dataset
ds = load_dataset(
    "svastikkka/BOOK-RECOMMENDER-DATASET",
    data_files="data/books_with_emotions.csv"
)

# pretvori u pandas dataframe
df = ds["train"].to_pandas()

# sačuvaj kao CSV
df.to_csv("books_dataset.csv", index=False)

print("Dataset sačuvan kao books_dataset.csv")