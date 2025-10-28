import pica from 'pica';

export interface ImageResizeOptions {
  maxDimension?: number;
  quality?: number;
}

export interface ImageService {
  resizeImage: (file: File, options?: ImageResizeOptions) => Promise<File>;
  fileToBase64: (file: File) => Promise<string>;
  validateImageFile: (file: File) => { isValid: boolean; error?: string };
}

const MAX_IMAGE_HEIGHT = 2000;
const JPEG_QUALITY = 0.95;

export const imageService: ImageService = {
  /**
   * Resize image using pica for high-quality downscaling
   * - Uses Lanczos filtering for better quality
   * - Maintains aspect ratio
   * - Returns resized File object
   */
  async resizeImage(file: File, options: ImageResizeOptions = {}): Promise<File> {
    const { maxDimension = MAX_IMAGE_HEIGHT, quality = JPEG_QUALITY } = options;
    
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = objectUrl;

    await img.decode();
    const { width, height } = img;

    // If both dimensions are below the threshold, skip resizing
    if (width <= maxDimension && height <= maxDimension) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // Calculate new dimensions (fit: inside)
    const aspect = width / height;
    let newWidth, newHeight;
    if (width > height) {
      newWidth = maxDimension;
      newHeight = Math.round(maxDimension / aspect);
    } else {
      newHeight = maxDimension;
      newWidth = Math.round(maxDimension * aspect);
    }

    // Source canvas
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const ctx = sourceCanvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);

    // Target canvas
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = newWidth;
    targetCanvas.height = newHeight;

    // Use pica for high-quality downscale (Lanczos)
    const picaInstance = pica();
    await picaInstance.resize(sourceCanvas, targetCanvas);

    // Convert to Blob, then to File
    const outputBlob = await picaInstance.toBlob(targetCanvas, file.type || 'image/png', quality);
    const resizedFile = new File([outputBlob], file.name, { type: outputBlob.type });

    URL.revokeObjectURL(objectUrl);
    return resizedFile;
  },

  /**
   * Convert file to base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  /**
   * Validate image file
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File phải là hình ảnh' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File quá lớn (tối đa 10MB)' };
    }

    return { isValid: true };
  },
};
