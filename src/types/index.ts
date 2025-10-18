export interface Shop {
  name: string;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  imageUrl: string;
  styleTags: string[];
  shop: Shop;
  createdAt?: string;
}

export interface Outfit {
  id: number;
  style: string;
  imageUrl?: string | null;
  products: Product[];
  createdAt?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface TryOnHistory {
  id: number;
  userId?: number | null;
  modelImageUrl: string;
  garmentImageUrl: string;
  resultImageUrl: string;
  modelVersion: string;
  createdAt: string;
}

export interface CostTracking {
  id: number;
  userId?: number | null;
  service: string;
  operation: string;
  cost: number;
  details?: string | null;
  createdAt: string;
}

export interface VirtualModel {
  id: number;
  userId: number;
  
  // Basic info
  avatarName: string;
  isPublic: boolean;
  
  // Body Metrics (Required)
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female' | 'non-binary';
  
  // Body Metrics (Optional)
  bodyShape?: 'slim' | 'balanced' | 'muscular' | 'curvy' | null;
  skinTone?: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark' | null;
  muscleLevel?: number | null; // 1-5
  fatLevel?: number | null; // 1-5
  shoulderWidth?: number | null; // cm
  waistSize?: number | null; // cm
  hipSize?: number | null; // cm
  legLength?: number | null; // cm
  
  // Appearance (Hair - Required)
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
  
  // Appearance (Optional)
  eyeColor?: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber' | null;
  faceShape?: 'round' | 'oval' | 'square' | 'triangle' | 'long' | null;
  beardStyle?: 'none' | 'goatee' | 'full' | 'stubble' | 'mustache' | null;
  tattoos?: string | null; // JSON or text description
  piercings?: string | null; // JSON or text description
  
  // Style (Optional)
  clothingStyle?: 'sport' | 'elegant' | 'street' | 'gothic' | 'casual' | 'business' | null;
  accessories?: string[] | null; // Array of accessories
  footwearType?: 'sneaker' | 'heels' | 'sandals' | 'boots' | 'formal' | null;
  colorPalette?: string[] | null; // Array of color codes
  
  // Additional
  ageAppearance?: number | null;
  bodyProportionPreset?: 'supermodel' | 'athletic' | 'realistic' | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateVirtualModelInput {
  avatarName: string;
  isPublic?: boolean;
  
  // Required fields
  height: number;
  weight: number;
  gender: string;
  hairColor: string;
  hairStyle: string;
  
  // Optional fields
  bodyShape?: string;
  skinTone?: string;
  muscleLevel?: number;
  fatLevel?: number;
  shoulderWidth?: number;
  waistSize?: number;
  hipSize?: number;
  legLength?: number;
  eyeColor?: string;
  faceShape?: string;
  beardStyle?: string;
  tattoos?: string;
  piercings?: string;
  clothingStyle?: string;
  accessories?: string[];
  footwearType?: string;
  colorPalette?: string[];
  ageAppearance?: number;
  bodyProportionPreset?: string;
}

