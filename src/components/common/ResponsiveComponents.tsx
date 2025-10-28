'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6',
  lg: 'px-6 sm:px-8',
  xl: 'px-8 sm:px-12',
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md',
  center = true,
}) => {
  const containerClasses = [
    'w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    center ? 'mx-auto' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={containerClasses}
    >
      {children}
    </motion.div>
  );
};

export interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = '',
}) => {
  const gridClasses = [
    'grid',
    `grid-cols-${columns.default}`,
    columns.sm ? `sm:grid-cols-${columns.sm}` : '',
    columns.md ? `md:grid-cols-${columns.md}` : '',
    columns.lg ? `lg:grid-cols-${columns.lg}` : '',
    columns.xl ? `xl:grid-cols-${columns.xl}` : '',
    gapClasses[gap],
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={gridClasses}
    >
      {children}
    </motion.div>
  );
};

export interface ResponsiveTextProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const colorClasses = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-700 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
  accent: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'md',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
}) => {
  const textClasses = [
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={textClasses}
    >
      {children}
    </motion.span>
  );
};

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  fill = false,
  objectFit = 'cover',
}) => {
  const imageClasses = [
    'transition-all duration-300',
    objectFit === 'contain' ? 'object-contain' : '',
    objectFit === 'cover' ? 'object-cover' : '',
    objectFit === 'fill' ? 'object-fill' : '',
    objectFit === 'none' ? 'object-none' : '',
    objectFit === 'scale-down' ? 'object-scale-down' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-lg"
    >
      {fill ? (
        <img
          src={src}
          alt={alt}
          className={imageClasses}
          style={{ width: '100%', height: '100%' }}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizes}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={imageClasses}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizes}
        />
      )}
    </motion.div>
  );
};
