export interface Pesticide {
  id: string;
  name: string;
  manufacturer: string;
  type: 'Herbicide' | 'Insecticide' | 'Fungicide';
  activeIngredients: string[];
  suggestedCrop: string;
  averageRating: number; // Out of 5
  description: string;
}

export const SAMPLE_PESTICIDES: Pesticide[] = [
  {
    id: 'P001',
    name: 'GreenGrow Max',
    manufacturer: 'AgriSolutions Co.',
    type: 'Herbicide',
    activeIngredients: ['Glyphosate (50%)', '2,4-D (10%)'],
    suggestedCrop: 'Corn',
    averageRating: 4.5,
    description: 'A broad-spectrum herbicide effective against most annual and perennial weeds in corn fields.',
  },
  {
    id: 'P002',
    name: 'PestAway Pro',
    manufacturer: 'FarmChem Innovations',
    type: 'Insecticide',
    activeIngredients: ['Neonicotinoid (25%)', 'Pyrethroid (5%)'],
    suggestedCrop: 'Soybeans',
    averageRating: 4.1,
    description: 'Highly effective systemic and contact insecticide for control of soybean aphids and bean leaf beetles.',
  },
  {
    id: 'P003',
    name: 'FungalStop 100',
    manufacturer: 'CropShield Corp.',
    type: 'Fungicide',
    activeIngredients: ['Azoxystrobin (70%)'],
    suggestedCrop: 'Potatoes',
    averageRating: 4.8,
    description: 'Protectant and curative fungicide for early and late blight in potato crops.',
  },
];