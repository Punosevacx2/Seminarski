import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";
import { ConsistencyLevelEnum } from "@zilliz/milvus2-sdk-node";
import dotenv from "dotenv";

dotenv.config();

// Ubaci vektor u kolekciju
export const insertVector = async (req: Request, res: Response) => {
  try {
    const {description, title, collectionName} = req.body;
    const vector=await getLocalEmbedding(description);

    const result = await milvusClient.insert({
      collection_name: collectionName || collectionName,
      fields_data: [{ vector, title, description}],  // polja u milvus bazi 
    });
    console.log("Pozvano kreiranje recepta");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus insert error" });
  }
};



// Brisanje vektora
export const deleteVector = async (req: Request, res: Response) => {
  try {
      const { id, collectionName } = req.params;
      const result = await milvusClient.deleteEntities({
      collection_name: collectionName|| "Proba1",
      expr: `id == ${id}`,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus delete error" });
  }
};

