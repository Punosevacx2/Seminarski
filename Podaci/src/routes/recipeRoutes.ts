import { Router } from "express";
import { RecipeService } from '../services/recipeService.ts';

const router = Router();
//ruta za postgresql bazu 
// src/routes/recipes.ts

router.get('/', async (_, res) => res.json(await RecipeService.getAllRecipes()));
router.get('/:id', async (req, res) => res.json(await RecipeService.getRecipeById(Number(req.params.id))));
router.post('/', async (req, res) => res.json(await RecipeService.createRecipe(req.body)));
router.put('/:id', async (req, res) => res.json(await RecipeService.updateRecipe(Number(req.params.id), req.body)));
router.delete('/:id', async (req, res) => res.json(await RecipeService.deleteRecipe(Number(req.params.id))));

export default router;
