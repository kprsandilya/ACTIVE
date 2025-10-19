import { Pesticide } from '../types';

/**
 * Calculates the similarity score (Jaccard Index) between two pesticides
 * based on their active ingredients.
 * Similarity = (|A intersect B| / |A union B|) * 100
 * @param p1 First pesticide product
 * @param p2 Second pesticide product
 * @returns Similarity score as a percentage (0 to 100)
 */
export const calculateSimilarity = (p1: Pesticide, p2: Pesticide): number => {
  if (!p1.activeIngredients.length || !p2.activeIngredients.length) {
    return 0;
  }

  // Normalize ingredients for accurate set comparison
  const set1 = new Set(p1.activeIngredients.map(ing => ing.trim().toLowerCase()));
  const set2 = new Set(p2.activeIngredients.map(ing => ing.trim().toLowerCase()));

  let intersectionSize = 0;
  
  // Calculate Intersection
  for (const item of set1) {
    if (set2.has(item)) {
      intersectionSize++;
    }
  }

  // Calculate Union Size: |A| + |B| - |A intersect B|
  const unionSize = set1.size + set2.size - intersectionSize;

  if (unionSize === 0) {
    return 0;
  }

  const similarity = (intersectionSize / unionSize) * 100;
  return parseFloat(similarity.toFixed(0)); // Round to nearest whole percentage
};