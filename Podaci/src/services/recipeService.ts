// src/services/recipeService.ts
import { db } from '../config/db.ts';
import { recipes } from '../database/schema/schemapg.ts';
import { eq } from 'drizzle-orm';

export const RecipeService = {
  // CREATE
  async createRecipe(data: { title: string; description: string; ingredients?: string }) {
    const [recipe] = await db.insert(recipes).values(data).returning();
    return recipe;
  },

  // READ ALL
  async getAllRecipes() {
    return await db.select().from(recipes);
  },

  // READ ONE
  async getRecipeById(id: number) {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  },

  // UPDATE
  async updateRecipe(id: number, data: Partial<{ title: string; description: string; ingredients: string }>) {
    const [updated] = await db.update(recipes).set(data).where(eq(recipes.id, id)).returning();
    return updated;
  },

  // DELETE
  async deleteRecipe(id: number) {
    const [deleted] = await db.delete(recipes).where(eq(recipes.id, id)).returning();
    return deleted;
  },
};
