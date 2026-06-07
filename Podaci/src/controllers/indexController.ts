import type { Request, Response } from 'express';
import { milvusClient, collectionName,createCollection } from '../database/schema/shemamilvus.ts';


export  const createMilvusIndex = async (req: Request, res: Response) =>  {
  try {
    const { fieldName, indexName, collectionName , metricType = "COSINE", indexType="IVF_FLAT" } = req.body;
    console.log(req.body);

    await milvusClient.releaseCollection({ collection_name: collectionName });

    const result = await milvusClient.createIndex({
      collection_name: collectionName || "Proba1",
      field_name: fieldName,
      index_name: indexName,
      index_type: indexType,   // npr. "IVF_FLAT"
      metric_type: metricType, 
      params: { nlist: 1024 },
      }
      );

    await milvusClient.loadCollection({ collection_name: collectionName });

    console.log(`✅ Index "${indexName}" created for collection "${collectionName}"`);

    res.json(result);

  } catch (err) {
    console.error("❌ Failed to create index:", err);
    throw err;
  }
}

export const listMilvusIndexes = async (req: Request, res: Response) => {
  try {
    const { collectionName, fieldName } = req.body;
    if (!collectionName || !fieldName) {
      return res.status(400).json({ message: "collectionName i fieldName su obavezni" });
    }

    // Poziv Milvus SDK da dobije informacije o indeksu za polje
    const result = await milvusClient.describeIndex({
      collection_name: collectionName,
      field_name: fieldName,
    });

    // result sadrži informacije o indeksu polja
    console.log("Pozvan endpoint za listanje indeksa");
    res.json({ collection: collectionName, field: fieldName, index: result });
  } catch (err) {
    console.error("❌ Failed to list indexes:", err);
    res.status(500).json({ message: "Failed to list indexes", error: err });
  }
};



export const dropMilvusIndex = async (req: Request, res: Response) => {
  try {
    const { collectionName, indexName } = req.params;
    console.log(collectionName+" "+indexName);
    if (!collectionName || !indexName) {
      return res.status(400).json({ message: "collectionName i indexName su obavezni" });
    }

        await milvusClient.releaseCollection({ collection_name: collectionName });


    const result = await milvusClient.dropIndex({
      collection_name: collectionName,
      index_name: indexName,
    });

    //await milvusClient.loadCollection({ collection_name: "Proba1" });

    console.log(`✅ Index "${indexName}" deleted from collection "${collectionName}"`);
    res.json({ message: `Index "${indexName}" deleted successfully`, result });
  } catch (err) {
    console.error("❌ Failed to delete index:", err);
    res.status(500).json({ message: "Failed to delete index", error: err });
  }
};
