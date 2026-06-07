import { MilvusClient, DataType, FunctionType } from '@zilliz/milvus2-sdk-node';
import dotenv from "dotenv";
dotenv.config();

export const milvusClient = new MilvusClient({
  address: `${process.env.MILVUS_HOST || '127.0.0.1'}:${process.env.MILVUS_PORT || 19530}`,
});

export const collectionName = (process.env.COLLECTION_NAME && process.env.COLLECTION_NAME.trim()) || "test";

export async function createCollection(collName: string) {
  const exists = await milvusClient.hasCollection({ collection_name: collName });
  if (exists.value) {
    console.log(`Collection ${collName} već postoji`);
    return;
  }

  await milvusClient.createCollection({
    collection_name: collName,
    fields: [
      { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
      { name: 'vector', data_type: DataType.FloatVector, dim: 768 },
      { name: 'title', data_type: DataType.VarChar, max_length: 256 },
      { name: 'description',data_type: DataType.VarChar,max_length: 10000,enable_analyzer: true,enable_match: true,},
      { name: 'text_sparse', data_type: DataType.SparseFloatVector },
    ],

    functions: [
      {
        name: 'bm25_from_description',
        description: 'bm25 function',
        type: FunctionType.BM25,
        input_field_names: ['description'],
        output_field_names: ['text_sparse'],
        params: {},
      },
    ],

    index_params: [
      { field_name: 'vector', index_type: 'AUTOINDEX', metric_type: process.env.METRIC_TYPE || "COSINE" },
      {
        field_name: 'text_sparse',
        index_type: 'SPARSE_INVERTED_INDEX',
        metric_type: 'BM25',
        params: { inverted_index_algo: 'DAAT_MAXSCORE' }, // ← preporučeno
      },
    ],
  });

  console.log(`✅ Kolekcija ${collName} kreirana`);
}
