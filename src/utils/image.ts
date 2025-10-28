// Image utility functions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const createImageThumbnail = (
  file: File, 
  maxWidth: number = 200, 
  maxHeight: number = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      
      // Calculate thumbnail dimensions
      let thumbWidth = width;
      let thumbHeight = height;
      
      if (width > height) {
        if (width > maxWidth) {
          thumbWidth = maxWidth;
          thumbHeight = (height * maxWidth) / width;
        }
      } else {
        if (height > maxHeight) {
          thumbHeight = maxHeight;
          thumbWidth = (width * maxHeight) / height;
        }
      }
      
      canvas.width = thumbWidth;
      canvas.height = thumbHeight;
      
      ctx?.drawImage(img, 0, 0, thumbWidth, thumbHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getImageAspectRatio = (width: number, height: number): number => {
  return width / height;
};

export const isImageLandscape = (width: number, height: number): boolean => {
  return width > height;
};

export const isImagePortrait = (width: number, height: number): boolean => {
  return height > width;
};

export const isImageSquare = (width: number, height: number): boolean => {
  return Math.abs(width - height) < 10; // Allow small tolerance
};
