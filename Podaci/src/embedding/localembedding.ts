let warmedUp = false;

export async function getLocalEmbedding(text: string): Promise<number[]> {
  const model = "nomic-embed-text";

  if (!warmedUp) {
    console.log("🔄 Warming up Nomic model...");
    await fetch("http://localhost:11434/api/embed", {
      method: "POST",
      body: JSON.stringify({ model, input: "init" }),
    });
    warmedUp = true;
    console.log("✅ Nomic embed model ready!");
  }

  const res = await fetch("http://localhost:11434/api/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: text })
  });

  const data = await res.json();
  return data.embeddings[0];
}
