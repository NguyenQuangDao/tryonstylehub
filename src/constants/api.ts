// API Constants
export const API_ENDPOINTS = {
  TRYON: '/api/tryon',
  VIRTUAL_MODELS: '/api/virtual-models',
  AVATAR_LIST: '/api/avatar/list',
  AVATAR_SAVE: '/api/avatar/save',
  AVATAR_LOAD: '/api/avatar/load',
  BODY_PARTS: '/api/body-parts',
  BODY_PARTS_COMPOSE: '/api/body-parts/compose',
  BODY_PARTS_COMPOSITIONS: '/api/body-parts/compositions',
  PRODUCTS: '/api/products',
  RECOMMEND: '/api/recommend',
  UPLOAD: '/api/upload',
  HEALTH: '/api/health',
  COST_STATS: '/api/cost-stats',
} as const;

export const API_TIMEOUT = 30000; // 30 seconds

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
] as const;
