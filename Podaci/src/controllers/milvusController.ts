import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";
import { ConsistencyLevelEnum , FunctionType} from "@zilliz/milvus2-sdk-node";
import dotenv from "dotenv";

dotenv.config();


export async function searchFullText(req: Request, res: Response) {
  try {
    const q = (req.query.text as string) || (req.body?.text as string);
    if (!q?.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    const k = req.query.k ? Number(req.query.k) : 5;
    const drop = req.query.drop ? Number(req.query.drop) : 0.2; // 0.0 = ne odbacuj
    const coll = (collectionName && collectionName.trim()) || "test";

    // učitaj kolekciju (posle starta procesa)
    await milvusClient.loadCollection({ collection_name: coll });

    // BM25 nad sparse poljem generisanim iz description
    const result = await milvusClient.search({
  collection_name: coll,
  data: [q],
  anns_field: "text_sparse",
  limit: k,
  params: { drop_ratio_search: drop }, 
  output_fields: ["id", "title", "description"],
  consistency_level: ConsistencyLevelEnum.Strong,
});
    return res.json({
      collection: coll,
      query: q,
      count: result.results.length,
      results: result.results,
    });
  } catch (err: any) {
    console.error("fulltextSearch error:", err);
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
}



export const searchVectors = async (req: Request, res: Response) => {
  try {
    console.log("Pozvan je endpoint searchVector");
    const { text, topK = 5, collectionName="test" , metricType = process.env.METRIC_TYPE, indexParams = { nprobe: 128 } } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required in the body" });
    }

    // Generiši embedding iz teksta
    const vector = await getLocalEmbedding(text);

    await milvusClient.loadCollection({
  collection_name: collectionName,
});
    console.log(collectionName);
    // Pretraži Milvus kolekciju
    const result = await milvusClient.search({
      collection_name: collectionName,
      vectors: [vector], //embeding kad se napravi 
      search_params: {
        anns_field: "vector",
        topk: topK,
        metric_type: metricType,  // L2, IP, COSINE itd.
        params: JSON.stringify(indexParams),
      },
      output_fields: ["title", "description","id"],  
    });
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus search error" });
  }
};

export async function searchHybrid(req: Request, res: Response) {

  const q = (req.query.text as string) || (req.body?.text as string);
    if (!q?.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }
 
  await milvusClient.loadCollection({ collection_name: collectionName });

  const qvec = await getLocalEmbedding(q);

  const result = await milvusClient.hybridSearch({
  collection_name: collectionName,

  data: [
    {
      anns_field: "vector",
      data: [qvec],
      params: { nprobe: 128 },
      topk: Math.max(5, 50),
    },
    {
      anns_field: "text_sparse",
      data: [q],
      params: { drop_ratio_search: 0.2 },
      limit: Math.max(5, 50),
    },
  ],
  
  limit: 5,
  output_fields: ["id", "title", "description"],
  consistency_level: ConsistencyLevelEnum.Strong,
});

  res.json(result);
}






export const queryFilterRoute = async (req: Request, res: Response) => {
  try {
    const { collectionName, filter = "id > 1000" } = req.body;

    if (!collectionName) {
      return res.status(400).json({ message: "collectionName is required in the body" });
    }
    const result = await milvusClient.query({
      collection_name: collectionName,
      expr: filter,
      output_fields: ["id", "title", "description"],
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus query error" });
  }
};

export async function searchByIdRoute(req: Request, res: Response) {
  try {
    const { id, collectionName } = req.body;
    if (!id || !collectionName) {
      return res.status(400).json({ error: "Nedostaje id ili collectionName" });
    }

    // Logika je u funkciji
    const result = await searchById(id, collectionName);
    res.json({ data: result.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška u pretrazi po ID-u" });
  }
}

export async function searchById(id: number, collectionName: string) {
  return milvusClient.query({
    collection_name: collectionName,
    expr: `id == ${id}`,
    output_fields: ["id", "title", "description"]
  });
}