import axios from "axios";
import dotenv from "dotenv";
import { milvusClient, collectionName , createCollection} from "../database/schema/shemamilvus.ts";
import { getLocalEmbedding } from "../embedding/localEmbedding.ts";
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { recipes } from '../database/schema/schemapg.ts';

dotenv.config();

export async function seedFromPostgres(collectionN : string) {
  // Konektuj se na PostgreSQL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const db = drizzle(client);

  // Dohvati sve recepte iz baze
  const allRecipes = await db.select().from(recipes);

  console.log(`Učitano ${allRecipes.length} recepata iz PostgreSQL baze`);

  for (const recipe of allRecipes) {
    // Generiši embedding samo za description
    //const text= recipe.title+" "+recipes.description;
    //const vector = await getLocalEmbedding(text);
    const vector = await getLocalEmbedding(recipe.description);

    // Ubaci u Milvus
    await milvusClient.insert({
      collection_name: collectionN,
      fields_data: [
        {                 
          title: recipe.title,
          description: recipe.description,
          vector,
        },
      ],
    });
  }

  console.log('Svi recepti ubačeni u Milvus!');
  await client.end();
}

