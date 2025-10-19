export interface Pesticide {
  id: string;
  name: string;
  manufacturer: string;
  type: 'Herbicide' | 'Insecticide' | 'Fungicide';
  active_ingredients: string[];
  suggested_crop: string;
  averageRating: number; // Out of 5
  description: string;
}