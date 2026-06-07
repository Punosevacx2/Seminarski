// getRecipeFull.ts
import "dotenv/config";

const API_KEY = process.env.SPOONACULAR_API_KEY;  // Tvoj API ključ
const RECIPE_ID = 716429;                   // Možeš promeniti ID

async function getRecipeFull(id: number) {
  if (!API_KEY) {
    throw new Error("❌ SPOON_API_KEY nije postavljen u .env fajl!");
  }

  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `❌ Spoonacular error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data; // ✅ vraća FULL RAW JSON
}

async function main() {
  try {
    const json = await getRecipeFull(RECIPE_ID);

    console.log("✅ Celi JSON odgovor:");
    console.log(JSON.stringify(json, null, 2)); 
    // null, 2 = VRAĆA LEPO FORMATIRAN JSON
    
  } catch (err) {
    console.error("Greška:", err);
  }
}

main();
