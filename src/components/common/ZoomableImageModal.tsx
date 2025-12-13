'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  images: string[];
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  onSave?: (imageUrl: string) => void;
};

export default function ZoomableImageModal({ images, isOpen, initialIndex = 0, onClose, onIndexChange, onSave }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setIndex(initialIndex); resetTransform(); }, [initialIndex]);

  const resetTransform = useCallback(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, []);

  const navigate = useCallback((dir: 'prev' | 'next') => {
    const next = dir === 'prev' ? Math.max(0, index - 1) : Math.min(images.length - 1, index + 1);
    if (next !== index) {
      resetTransform();
      onIndexChange?.(next);
      setIndex(next);
    }
  }, [index, images.length, onIndexChange, resetTransform]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigate('prev'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigate('next'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, navigate, onClose]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 0.08 : -0.08;
    setScale(s => Math.min(5, Math.max(1, s + factor)));
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !lastPosRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
  }, [dragging]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(false);
    lastPosRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const currentUrl = useMemo(() => {
    const url = images[index];
    return typeof url === 'string' && url.trim().length > 0 ? url : undefined;
  }, [images, index]);

  return (
    <AnimatePresence>
      {isOpen && images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div ref={containerRef} className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </motion.button>

            <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{index + 1} / {images.length}</span>
                {images.length > 1 && (<span className="text-xs opacity-90">• ← →</span>)}
              </div>
            </div>

            {index > 0 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </motion.button>
            )}
            {index < images.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </motion.button>
            )}

            <div
              className="w-full h-full flex items-center justify-center p-4"
              onWheel={onWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <div className="relative" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transition: dragging ? 'none' : 'transform 120ms ease-out' }}>
                {currentUrl ? (
                  <Image
                    src={currentUrl}
                    alt="image"
                    className="w-auto h-auto max-w-[min(90vw,1200px)] max-h-[min(85vh,1600px)] object-contain select-none"
                    width={1200}
                    height={1600}
                    unoptimized
                    draggable={false}
                  />
                ) : (
                  <div className="text-white/80 text-sm px-3 py-2 rounded bg-white/5 border border-white/10">
                    Không có ảnh hợp lệ
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              {currentUrl && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Tải xuống
              </motion.a>
              )}
              {onSave && currentUrl && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSave(currentUrl)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Lưu
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
