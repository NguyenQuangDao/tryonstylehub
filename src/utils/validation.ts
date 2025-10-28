import { z } from 'zod';

// Image validation schemas
export const imageFileSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().optional().default(10 * 1024 * 1024), // 10MB
  allowedTypes: z.array(z.string()).optional().default([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]),
});

export const tryOnRequestSchema = z.object({
  model_image: z.string().min(1, 'Model image is required'),
  garment_image: z.string().min(1, 'Garment image is required'),
  garment_photo_type: z.string().min(1, 'Garment photo type is required'),
  category: z.string().min(1, 'Category is required'),
  mode: z.string().min(1, 'Mode is required'),
  segmentation_free: z.boolean(),
  seed: z.number().min(0),
  num_samples: z.number().min(1).max(4),
  api_key: z.string().optional(),
  model_name: z.string().optional(),
});

export const virtualModelSchema = z.object({
  avatarName: z.string().min(1, 'Avatar name is required'),
  height: z.number().min(100).max(250, 'Height must be between 100-250 cm'),
  weight: z.number().min(30).max(200, 'Weight must be between 30-200 kg'),
  gender: z.enum(['male', 'female', 'non-binary'], {
    errorMap: () => ({ message: 'Gender must be male, female, or non-binary' }),
  }),
  bodyType: z.string().optional(),
  skinTone: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
});

// Validation functions
export const validateImageFile = (file: File, options?: {
  maxSize?: number;
  allowedTypes?: string[];
}): { isValid: boolean; error?: string } => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] } = options || {};

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large' };
  }

  return { isValid: true };
};

export const validateTryOnRequest = (data: unknown) => {
  return tryOnRequestSchema.parse(data);
};

export const validateVirtualModel = (data: unknown) => {
  return virtualModelSchema.parse(data);
};
