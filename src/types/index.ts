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

