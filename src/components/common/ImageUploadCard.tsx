'use client';

import { FileInput } from '@/components';
import { useImageUpload } from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent } from 'react';

interface ImageUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  exampleIndex: number;
  onExampleChange?: (index: number) => void;
  onSwipe: (direction: 'left' | 'right') => void;
  accept?: string;
  label: string;
  className?: string;
}

export const ImageUploadCard: React.FC<ImageUploadCardProps> = ({
  title,
  description,
  icon,
  examples,
  exampleIndex,
  onSwipe,
  accept = "image/*",
  label,
  className = "",
}) => {
  const imageUpload = useImageUpload();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleImageChange(e);
  };

  const loadExampleImage = async (imageUrl: string) => {
    await imageUpload.loadExampleImage(imageUrl);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className={`modern-card group ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
          >
            {icon}
          </motion.div>
          <div>
            <h3 className="text-headline-sm md:text-headline-md font-semibold modern-gradient-text vietnamese-heading">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {imageUpload.imagePreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="modern-image-container aspect-[2/2.5] max-w-[400px] max-h-[500px] mx-auto flex items-center justify-center overflow-hidden">
                <Image
                  src={imageUpload.imagePreview}
                  alt={`${title} Preview`}
                  className="max-w-full max-h-full object-contain p-4"
                  width={400}
                  height={500}
                  unoptimized
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={imageUpload.clearImage}
                className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full p-2 shadow-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="modern-image-container aspect-[2/2.5] max-w-[400px] max-h-[500px] mx-auto border-2 border-dashed border-blue-300 dark:border-blue-700 relative overflow-hidden"
            >
              {/* Top overlay with text */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-sm text-white px-4 py-2.5 rounded-full shadow-lg">
                  {icon}
                  <p className="text-sm font-medium">Chọn {title.toLowerCase()}</p>
                </div>
              </div>

              {/* Main example content taking most space */}
              {examples.length > 0 ? (
                <div className="w-full h-full relative">
                  <motion.button
                    key={exampleIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (info.offset.x > 50) {
                        onSwipe('left');
                      } else if (info.offset.x < -50) {
                        onSwipe('right');
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadExampleImage(examples[exampleIndex]);
                    }}
                    className="w-full h-full cursor-pointer group"
                  >
                    <Image
                      src={examples[exampleIndex]}
                      alt={`${title} Example ${exampleIndex + 1}`}
                      width={400}
                      height={500}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Swipe hint overlay */}
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-gray-900/95 text-black dark:text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-white">
                        👆 Nhấn để sử dụng • Vuốt để xem thêm
                      </div>
                    </div>
                  </motion.button>

                  {/* Navigation controls at bottom */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwipe('left');
                      }}
                      disabled={exampleIndex === 0}
                      className="w-10 h-10 rounded-full bg-black/70 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/50 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>

                    {/* Dots indicator */}
                    <div className="flex gap-2">
                      {examples.map((_, idx) => (
                        <motion.div
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${idx === exampleIndex ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                          whileHover={{ scale: 1.3 }}
                        />
                      ))}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwipe('right');
                      }}
                      disabled={exampleIndex === examples.length - 1}
                      className="w-10 h-10 rounded-full bg-black/70 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/50 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {icon}
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Không có ví dụ
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FileInput
          onChange={handleImageChange}
          accept={accept}
          label={label}
        />
      </div>
    </motion.div>
  );
};
