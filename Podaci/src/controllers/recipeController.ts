import type { Request, Response } from "express";
import { db } from "../config/db";
import { recipes } from "../database/schema/schemapg.ts";
import { eq } from "drizzle-orm";
import express from "express";

// funkcije koje rade sa postgresql bazom 
export const getAllRecipes = async (_req: Request, res: Response) => {
  try {
    const all = await db.select().from(recipes);
    res.json(all);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await db.select().from(recipes).where(eq(recipes.id, Number(id)));
    if (!recipe.length) return res.status(404).json({ message: "Not found" });
    res.json(recipe[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addRecipe = async (req: Request, res: Response) => {
  try {
    const { title, description, ingredients } = req.body;
    const result = await db.insert(recipes).values({ title, description, ingredients }).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
