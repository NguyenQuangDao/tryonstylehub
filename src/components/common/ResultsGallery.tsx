'use client';

import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import ZoomableImageModal from './ZoomableImageModal';

interface ResultsGalleryProps {
  results: string[];
  isLoading: boolean;
  isComparisonMode: boolean;
  selectedResults: number[];
  onResultSelection: (index: number) => void;
  onToggleComparisonMode: () => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  results,
  isLoading,
  isComparisonMode,
  selectedResults,
  onResultSelection,
  onToggleComparisonMode,
}) => {
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Handle navigating results in modal
  const navigateResult = useCallback((direction: 'prev' | 'next') => {
    setCurrentResultIndex(prevIndex => {
      if (direction === 'prev' && prevIndex > 0) {
        return prevIndex - 1;
      }
      if (direction === 'next' && prevIndex < results.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [results.length]);

  // Keyboard navigation for results modal
  useEffect(() => {
    if (!isResultsModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateResult('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateResult('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsResultsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResultsModalOpen, navigateResult]);

  // Handle opening results modal
  const openResultsModal = (index: number) => {
    setCurrentResultIndex(index);
    setIsResultsModalOpen(true);
  };

  // Handle saving result to gallery
  const handleSaveResult = async (imageUrl: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/gallery/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          type: 'tryon'
        }),
      });

      if (response.ok) {
        alert('Đã lưu ảnh vào bộ sưu tập!');
      } else {
        const data = await response.json();
        alert(data.error || 'Không thể lưu ảnh');
      }
    } catch {
      alert('Có lỗi xảy ra khi lưu ảnh');
    } finally {
      setSaving(false);
    }
  };

  const handleResultSelection = (index: number) => {
    if (!isComparisonMode) {
      openResultsModal(index);
      return;
    }

    onResultSelection(index);
  };

  return (
    <>
      <div className="modern-card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold modern-gradient-text">
                Kết Quả Thử Đồ
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Xem kết quả thử đồ ảo của bạn
              </p>
            </div>
          </div>
          {results.length > 1 && !isLoading && (
            <div className="flex items-center gap-2">
              {isComparisonMode && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Chọn 2 kết quả để so sánh ({selectedResults.length}/2)
                </span>
              )}
              <Button
                onClick={onToggleComparisonMode}
                variant={isComparisonMode ? "default" : "secondary"}
                size="sm"
              >
                {isComparisonMode ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Hủy
                  </>
                ) : (
                  <>
                    ⚖️ So Sánh
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-6"
              >
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                  <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Đang tạo kết quả thử đồ ảo...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 animate-pulse">
                    Vui lòng chờ trong giây lát
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modern-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {results.map((url, index) => {
                  const isSelected = selectedResults.includes(index);
                  const canSelect = isComparisonMode && (selectedResults.length < 2 || isSelected);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: { delay: index * 0.05, duration: 0.2 }
                      }}
                      className={cn(
                        "relative group cursor-pointer",
                        isSelected && "ring-2 ring-blue-500 ring-offset-2",
                        isComparisonMode && !canSelect && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleResultSelection(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleResultSelection(index);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={isComparisonMode ? `${isSelected ? 'Deselect' : 'Select'} result ${index + 1} for comparison` : `View result ${index + 1} in full screen`}
                    >
                      <div className="modern-image-container aspect-[2/3] flex items-center justify-center overflow-hidden">
                        <Image
                          src={url}
                          alt={`Result ${index + 1}`}
                          className="max-w-full max-h-full object-contain p-3"
                          width={300}
                          height={400}
                        />
                      </div>

                      {/* Selection indicator */}
                      {isComparisonMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                            isSelected ? "bg-blue-500 border-blue-500 text-white" : "bg-white/90 border-gray-400 text-gray-600"
                          )}>
                            {isSelected ? selectedResults.indexOf(index) + 1 : ""}
                          </div>
                        </div>
                      )}

                      {/* Hover overlay */}
                      {!isComparisonMode && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 dark:from-white/30 to-transparent">
                          <div className="bg-blue-600/90 dark:bg-blue-500/90 text-white dark:text-gray-900 py-2 px-4 rounded-full text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
                            <Zap className="h-4 w-4" />
                            Nhấn để xem toàn màn hình
                          </div>
                        </div>
                      )}

                      {/* Comparison mode overlay */}
                      {isComparisonMode && canSelect && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-purple-900/60 dark:from-purple-100/30 to-transparent">
                          <div className="bg-purple-600/90 dark:bg-purple-500/90 text-white dark:text-gray-900 py-2 px-4 rounded-full text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
                            ⚖️
                            {isSelected ? 'Bỏ chọn' : 'Chọn để so sánh'}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ZoomableImageModal
        images={results}
        isOpen={isResultsModalOpen}
        initialIndex={currentResultIndex}
        onClose={() => setIsResultsModalOpen(false)}
        onIndexChange={(i) => setCurrentResultIndex(i)}
        onSave={(url) => handleSaveResult(url)}
      />
    </>
  );
};
