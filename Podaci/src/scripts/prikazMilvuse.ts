import { milvusClient, collectionName } from "../database/schema/shemamilvus.ts";

function zeroVec(n: number) { return Array(n).fill(0); }

async function waitIndexReady(coll: string, field = "text_sparse") {
  // poll-uj dok indexed_rows ne stigne total_rows i state=Finished
  for (let i = 0; i < 20; i++) {
    const idx = await milvusClient.describeIndex({ collection_name: coll, field_name: field });
    const d = idx.index_descriptions?.[0];
    const indexed = Number(d?.indexed_rows || 0);
    const total   = Number(d?.total_rows  || 0);
    const state   = d?.state;
    console.log(`INDEX STATE: ${state}, indexed_rows=${indexed}, total_rows=${total}`);
    if (state === "Finished" && indexed >= total && total > 0) return;
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function run() {
  const coll = (collectionName && collectionName.trim()) || "test";
  console.log("→ PROBING BM25 on collection:", coll);

  // 0) izvučemo DIM iz šeme (kod tebe je 768)
  const desc = await milvusClient.describeCollection({ collection_name: coll });
  const vecField: any = desc.schema?.fields?.find((f: any) => f.name === "vector");
  const dimParam = (vecField?.type_params || vecField?.params || []).find((p: any) => (p.key || p.Key) === "dim");
  const DIM = Number(dimParam?.value || 768);
  console.log("VECTOR DIM (from schema):", DIM);

  // 1) ubacimo test zapis – isključivo slovni token
  const payload = {
    title: "BM25 test recept",
    description: "piletina paprika paradajz probapiletina", // čisto slovo, bez cifara
    vector: zeroVec(DIM),
  };
  const ins = await milvusClient.insert({ collection_name: coll, fields_data: [payload] });
  console.log("INSERT STATUS:", ins.status);

  // 2) flush + rebuild provera
  await milvusClient.flush({ collection_names: [coll] });

  // (opciono) FORSIRAJ ponovno kreiranje indeks-a ako ne “pokupi” novi red
  // Ovo nije uvek potrebno, ali ako indexed_rows zaostaje, odradi rebuild:
  let idx = await milvusClient.describeIndex({ collection_name: coll, field_name: "text_sparse" });
  let d = idx.index_descriptions?.[0];
  let indexed = Number(d?.indexed_rows || 0);
  let total   = Number(d?.total_rows  || 0);
  console.log("INDEX BEFORE LOAD:", { state: d?.state, indexed_rows: indexed, total_rows: total });

  if (!(d?.state === "Finished" && indexed >= total && total > 0)) {
    console.log("→ Rebuilding SPARSE index…");
    await milvusClient.createIndex({
      collection_name: coll,
      field_name: "text_sparse",
      index_type: "SPARSE_INVERTED_INDEX",
      metric_type: "BM25",
    });
    await waitIndexReady(coll, "text_sparse");
  }

  // 3) load
  await milvusClient.loadCollection({ collection_name: coll });

  // 4) stats (row_count)
  const stats = await milvusClient.getCollectionStatistics({ collection_name: coll });
  console.log("STATS AFTER INSERT:", stats.stats);

  // 5) pretraga BM25 baš po "probapiletina"
  const result = await milvusClient.search({
    collection_name: coll,
    data: ["piletina"],
    anns_field: "text_sparse",
    limit: 3,
    metric_type: "BM25",
    output_fields: ["title", "description"],
    search_params: { params: { drop_ratio_search: 0.0 } },
  });

  console.log("BM25 PROBE COUNT:", result.results.length);
  console.dir(result.results, { depth: null });
}

run().catch(e => { console.error(e); process.exit(1); });
