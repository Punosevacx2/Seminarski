// src/scripts/popunipg.ts
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { translateBatchOpenAI } from "./translateOpenAI.ts";
import { recipes } from "../database/schema/schemapg.ts";

// HARD-CODED konekcije:
const READ_DB  = "postgres://postgres:postgres@localhost:5432/recipesdb?sslmode=disable";      // izvor
const WRITE_DB = "postgres://postgres:postgres@localhost:5432/srpski?sslmode=disable";   // cilj

type SrcRow = {
  id: number;
  title: string | null;
  description: string | null;
  ingredients: string | null;
};

const READ_BATCH   = 500;
const TRANS_BATCH  = 10;   // manji batch = bolji progres/logovi
const INSERT_CHUNK = 500;

async function main() {
  // source PG (plain pg)
  const src = new Client({ connectionString: READ_DB });
  await src.connect();
  console.log("Connected → source (recipesdb)");

  // target PG + Drizzle
  const dstClient = new Client({ connectionString: WRITE_DB });
  await dstClient.connect();
  const db = drizzle(dstClient);
  console.log("Connected → target (recipesdbsrb)");

  // (opciono) kreiraj tabelu ako ne postoji
  await dstClient.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT
    );
  `);

  // pročitaj sve iz izvora
  const { rows } = await src.query<SrcRow>(`
    SELECT id, title, description, ingredients
    FROM recipes
    ORDER BY id;
  `);

  if (!rows.length) {
    console.log("Nema zapisa u izvornoj tabeli.");
    await src.end(); await dstClient.end();
    return;
  }

  console.log(`Za obradu: ${rows.length} recepata`);

  const srRows: { title: string; description: string; ingredients: string | null }[] = [];

  for (let i = 0; i < rows.length; i += TRANS_BATCH) {
    const chunk = rows.slice(i, i + TRANS_BATCH);

    const titles       = chunk.map(r => r.title ?? "");
    const descriptions = chunk.map(r => r.description ?? "");

    console.log(`→ Prevodi batch ${i}-${i + chunk.length - 1} (size=${chunk.length})`);

    // 1) PREVOD NASLOVA
    const t0 = Date.now();
    const titlesSR = await translateBatchOpenAI(titles);
    const t1 = Date.now();

    // 2) PREVOD OPISA
    const descSR = await translateBatchOpenAI(descriptions);
    const t2 = Date.now();

    console.log(`✓ Naslovi:  ${( (t1 - t0)/1000 ).toFixed(1)}s, Opisi: ${ ( (t2 - t1)/1000 ).toFixed(1)}s`);

    // sanity sample za prvi batch
    if (i === 0) {
      console.log("Sample TITLE EN:", titles[0]);
      console.log("Sample TITLE SR:", titlesSR[0]);
      console.log("Sample DESC  EN:", descriptions[0]);
      console.log("Sample DESC  SR:", descSR[0]);
    }

    for (let j = 0; j < chunk.length; j++) {
      const r = chunk[j]!;
      const titleSr = (titlesSR[j] || r.title || "").slice(0, 255);
      const descSr  = (descSR[j]   || r.description || "");

      srRows.push({
        title: titleSr,
        description: descSr,
        ingredients: r.ingredients ?? null,
      });
    }

    console.log(`Prevedeno ukupno: ${srRows.length}/${rows.length}`);
  }

  // INSERT u ciljnu bazu (chunk-ovi)
  console.log(`Upis u recipesdbsrb.public.recipes: ${srRows.length} redova…`);
  for (let i = 0; i < srRows.length; i += INSERT_CHUNK) {
    const chunk = srRows.slice(i, i + INSERT_CHUNK);
    await db.insert(recipes).values(chunk);
    console.log(`Upisano: ${Math.min(i + INSERT_CHUNK, srRows.length)}/${srRows.length}`);
  }

  console.log("✅ Gotovo.");
  await src.end();
  await dstClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
