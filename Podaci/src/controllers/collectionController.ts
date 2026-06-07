import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';
import { seedFromPostgres } from "../scripts/popuniMilvus.ts"

// Kreiraj kolekciju
export const createMilvusCollection = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await createCollection(name || collectionName);
    seedFromPostgres(name || collectionName); //popunjavamo je odmah podacima
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Milvus error" });
  }
};

// 📋 Lista kolekcija
export const  listCollections= async (req: Request, res: Response)=> {
  try {
    const result = await milvusClient.listCollections();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// 🔍 Detalji kolekcije
export const describeCollection = async (req: Request, res: Response)=>{
  try {
    const name = req.params.name;
    const result = await milvusClient.describeCollection({ collection_name: name || collectionName});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// 🗑️ Brisanje kolekcije
export const dropCollection = async(req: Request, res: Response)=> {
  try {
    const name = req.params.name;
    const result = await milvusClient.dropCollection({ collection_name: name || collectionName });
    res.json({ message: `Kolekcija '${name}' obrisana.`, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

