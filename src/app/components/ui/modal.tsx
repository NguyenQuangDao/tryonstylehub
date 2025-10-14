import { X } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Handle click on backdrop to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = (
    <div 
      className="modal-overlay"
      data-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647, // Maximum z-index
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        pointerEvents: 'auto'
      }}
    >
      {/* Backdrop overlay */}
      <div
        className="modal-backdrop bg-black/60 backdrop-blur-md"
        onClick={handleBackdropClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Modal content */}
      <div
        className={cn(
          "modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/20 dark:border-gray-700/50",
          className
        )}
        style={{
          position: 'relative',
          zIndex: 2,
          margin: 'auto',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          pointerEvents: 'auto'
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* If no title, just add a close button in the corner */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Content */}
        <div className="p-6 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );

  return isOpen ? createPortal(modalContent, document.body) : null;
}