import { ZOOM_CONFIG } from '@/constants/body-preview';
import { useCallback, useState } from 'react';

/**
 * Custom hook for zoom and pan functionality
 * @returns Zoom and pan state and handlers
 */
export function useZoomPan() {
  const [zoomLevel, setZoomLevel] = useState(ZOOM_CONFIG.DEFAULT);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + ZOOM_CONFIG.STEP, ZOOM_CONFIG.MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - ZOOM_CONFIG.STEP, ZOOM_CONFIG.MIN));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(ZOOM_CONFIG.DEFAULT);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_CONFIG.STEP / 2.5 : ZOOM_CONFIG.STEP / 2.5;
    setZoomLevel((prev) => Math.max(ZOOM_CONFIG.MIN, Math.min(ZOOM_CONFIG.MAX, prev + delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      }
    },
    [zoomLevel, panX, panY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoomLevel > 1) {
        setPanX(e.clientX - dragStart.x);
        setPanY(e.clientY - dragStart.y);
      }
    },
    [isDragging, zoomLevel, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    zoomLevel,
    panX,
    panY,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}


