'use client';

import { ZOOM_CONFIG } from '@/constants/body-preview';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface PreviewControlsProps {
  zoomLevel: number;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
}

/**
 * PreviewControls Component
 * Controls for zoom and fullscreen in body preview
 */
export default function PreviewControls({
  zoomLevel,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
}: PreviewControlsProps) {
  return (
    <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoomLevel >= ZOOM_CONFIG.MAX}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Phóng to"
      >
        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoomLevel <= ZOOM_CONFIG.MIN}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Thu nhỏ"
      >
        <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Đặt lại"
      >
        <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-200" />
      </button>

      <div className="h-px bg-gray-300 dark:bg-gray-600 my-1" />

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
        ) : (
          <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
        )}
      </button>

      <div className="text-[10px] text-center text-gray-600 dark:text-gray-400 px-2 py-1">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}


