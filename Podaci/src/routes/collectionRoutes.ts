import type {  Request, Response } from 'express';
import Router from 'express';
import { milvusClient } from '../database/schema/shemamilvus.ts';

const router = Router();

// VISE NIJE POTREBNA U shemamilvus.ts IMAM ISTU FUNKCIJU   
/*
router.post('/:collectionName/index', async (req: Request, res: Response) => {
  const { collectionName } = req.params;
  const { fieldName, indexName, indexType, metricType, params } = req.body;
    
  try {
    const result = await milvusClient.createIndex({
      collection_name: collectionName || "test2",  // morala je neka vrednost ako collectionName nema vrednost 
      field_name: fieldName,        
      index_name: indexName,        
      index_type: indexType,        //  "IVF_FLAT"
      metric_type: metricType,      //  "L2"
      params: params || { nlist: 1024 },
    });

    /*
    TIP INDEXA
        ZA FLOAT VEKTORE 
            FLAT – linearna pretraga (bruteforce)
            IVF_FLAT – Inverted File + FLAT
            IVF_SQ8 – IVF + Scalar Quantization (8-bit)
            IVF_PQ – IVF + Product Quantization
            HNSW – Hierarchical Navigable Small World graf
            ANNOY – Approximate Nearest Neighbor Oh Yeah (neke verzije Milvus podržavaju)
            DISKANN – Disk-based ANN (novije verzije)

    METRIKA INDEXA
        ZA FLOAT VEKTORE
            L2 – Euclidean distance
            IP – Inner Product
            COSINE – Cosine similarity
        
    

    res.json({ message: 'Index created', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create index', error: err });
  }
});

export default router;*/
