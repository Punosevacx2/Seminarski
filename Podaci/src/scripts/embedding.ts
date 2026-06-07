import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";

export async function createMilvusIndex(
  collectionName: string,
  fieldName: string,
  indexName: string,
  indexType: string,
  metricType: string,
  params: object = { nlist: 1024 }
) {
  try {
    const result = await milvusClient.createIndex({
      collection_name: collectionName || "Proba1",
      field_name: fieldName,
      index_name: indexName,
      index_type: indexType,   // npr. "IVF_FLAT"
      metric_type: metricType, 
      //params,
      }
      );

    console.log(`✅ Index "${indexName}" created for collection "${collectionName}"`);
    return result;

  } catch (err) {
    console.error("❌ Failed to create index:", err);
    throw err;
  }
}



export async function searchVectors(
  text: string,
  collectionName: string,
  topK: number = 5,
  metricType: string = "L2",
  indexParams: object = { nprobe: 10 }
) {
  try {
    if (!text) {
      throw new Error("❌ Text is required for vector search.");
    }

    // 1️⃣ Generiši embedding iz teksta (lokalni model)
    const vector = await getLocalEmbedding(text);

    // 2️⃣ Pretraži Milvus kolekciju
    const result = await milvusClient.search({
      collection_name: collectionName,
      vectors: [vector],
      search_params: {
        anns_field: "vector",
        topk: topK,
        metric_type: metricType,
        params: JSON.stringify(indexParams),
      },
      output_fields: ["title", "description"],
    });

    console.log(`🔍 Search done in collection "${collectionName}" — found ${result.results?.length || 0} results`);
    return result;

  } catch (err) {
    console.error("❌ Milvus search error:", err);
    throw err;
  }
}


async function main() {
  await createMilvusIndex(
    collectionName,       // ime tvoje kolekcije u Milvusu
    "vector",             // polje nad kojim praviš indeks
    "vector_index",       // ime indeksa
    "IVF_FLAT",           // tip indeksa
    "COSINE",             // metrika (L2, IP, COSINE)
    { nlist: 128 }        // dodatni parametri
  );
}

async function main1() {
  const results = await searchVectors(
    "recipe without sugar",  // tekst koji tražiš
    collectionName,             // kolekcija u Milvusu
    5,                                // broj rezultata
    "COSINE",                             // metrika
    { nprobe: 128 }                    // parametri pretrage
  );

  console.log("Rezultati:", JSON.stringify(results.results, null, 2));
}

//main().catch(console.error);

//main1().catch(console.error);



