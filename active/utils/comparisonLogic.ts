import { Pesticide } from '../types';

/**
 * Calculates a comprehensive similarity score between two pesticides
 * considering active ingredients, type, and suggested crop.
 * Weighted factors:
 * - Active ingredients: 70%
 * - Type: 15%
 * - Suggested crop: 15%
 * Returns a percentage between 0 and 100.
 */
export const calculateSimilarity = (p1: Pesticide, p2: Pesticide): number => {
  // --- Active Ingredients Similarity (Jaccard Index) ---
  const ingredients1 = p1.active_ingredients?.map(i => i.trim().toLowerCase()) || [];
  const ingredients2 = p2.active_ingredients?.map(i => i.trim().toLowerCase()) || [];
  
  let ingredientScore = 0;
  if (ingredients1.length && ingredients2.length) {
    const set1 = new Set(ingredients1);
    const set2 = new Set(ingredients2);
    const intersectionSize = [...set1].filter(i => set2.has(i)).length;
    const unionSize = set1.size + set2.size - intersectionSize;
    ingredientScore = unionSize === 0 ? 0 : (intersectionSize / unionSize) * 100;
  }

  // --- Type Similarity ---
  const typeScore = p1.type?.trim().toLowerCase() === p2.type?.trim().toLowerCase() ? 100 : 0;

  // --- Suggested Crop Similarity ---
  const cropScore = p1.suggested_crop?.trim().toLowerCase() === p2.suggested_crop?.trim().toLowerCase() ? 100 : 0;

  // --- Weighted Combination ---
  const weightedScore = 
    ingredientScore * 0.7 + 
    typeScore * 0.15 + 
    cropScore * 0.15;

  return parseFloat(weightedScore.toFixed(0)); // Round to nearest integer
};
