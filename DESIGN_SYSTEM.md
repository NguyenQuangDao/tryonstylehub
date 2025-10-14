# AIStyleHub Design System

## Overview
AIStyleHub is a modern AI-powered virtual try-on and fashion platform built with Next.js. This design system provides comprehensive guidelines for creating a cohesive, accessible, and beautiful user experience.

## Design Principles

### 1. Mobile-First Approach
- All designs start with mobile (320px+) and scale up
- Touch-friendly interface elements (minimum 44px touch targets)
- Optimized for thumb navigation
- Progressive enhancement for larger screens

### 2. Accessibility (WCAG 2.1 AA)
- High contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators for all interactive elements
- Semantic HTML structure

### 3. Performance
- Optimized images and assets
- Minimal JavaScript for interactions
- CSS-only animations where possible
- Lazy loading for non-critical content

### 4. Visual Appeal
- Clean, minimalist aesthetic
- Ample whitespace for breathing room
- Consistent visual hierarchy
- Modern design trends with timeless appeal

## Color Palette

### Primary Colors (Blue)
```css
--primary-50: #EFF6FF   /* Lightest blue for backgrounds */
--primary-100: #DBEAFE  /* Light blue for subtle highlights */
--primary-200: #BFDBFE  /* Light blue for borders */
--primary-300: #93C5FD  /* Medium light blue */
--primary-400: #60A5FA  /* Medium blue */
--primary-500: #3B82F6  /* Primary brand color */
--primary-600: #2563EB  /* Primary hover state */
--primary-700: #1D4ED8  /* Primary active state */
--primary-800: #1E40AF  /* Dark blue for text */
--primary-900: #1E3A8A  /* Darkest blue for emphasis */
```

### Secondary Colors (Slate)
```css
--secondary-50: #F8FAFC   /* Lightest gray for backgrounds */
--secondary-100: #F1F5F9  /* Light gray for subtle backgrounds */
--secondary-200: #E2E8F0  /* Light gray for borders */
--secondary-300: #CBD5E1  /* Medium light gray */
--secondary-400: #94A3B8  /* Medium gray */
--secondary-500: #64748B  /* Base gray */
--secondary-600: #475569  /* Dark gray for text */
--secondary-700: #334155  /* Darker gray */
--secondary-800: #1E293B  /* Very dark gray */
--secondary-900: #0F172A  /* Darkest gray for text */
```

### Accent Colors (Purple)
```css
--accent-purple-50: #FAF5FF   /* Lightest purple for backgrounds */
--accent-purple-100: #F3E8FF  /* Light purple for highlights */
--accent-purple-200: #E9D5FF  /* Light purple for borders */
--accent-purple-300: #D8B4FE  /* Medium light purple */
--accent-purple-400: #C084FC  /* Medium purple */
--accent-purple-500: #A855F7  /* Primary accent color */
--accent-purple-600: #9333EA  /* Accent hover state */
--accent-purple-700: #7C3AED  /* Accent active state */
--accent-purple-800: #6B21A8  /* Dark purple for text */
--accent-purple-900: #581C87  /* Darkest purple for emphasis */
```

### Semantic Colors

#### Success (Green)
```css
--success-50: #F0FDF4   /* Success backgrounds */
--success-100: #DCFCE7  /* Light success */
--success-500: #22C55E  /* Primary success */
--success-600: #16A34A  /* Success hover */
--success-700: #15803D  /* Success active */
```

#### Warning (Amber)
```css
--warning-50: #FFFBEB   /* Warning backgrounds */
--warning-100: #FEF3C7  /* Light warning */
--warning-500: #F59E0B  /* Primary warning */
--warning-600: #D97706  /* Warning hover */
--warning-700: #B45309  /* Warning active */
```

#### Error (Red)
```css
--error-50: #FEF2F2    /* Error backgrounds */
--error-100: #FEE2E2   /* Light error */
--error-500: #EF4444   /* Primary error */
--error-600: #DC2626   /* Error hover */
--error-700: #B91C1C   /* Error active */
```

### Neutral Colors
```css
--neutral-50: #FAFAFA   /* Pure white backgrounds */
--neutral-100: #F5F5F5  /* Light neutral */
--neutral-200: #E5E5E5  /* Light borders */
--neutral-300: #D4D4D4  /* Medium light */
--neutral-400: #A3A3A3  /* Medium neutral */
--neutral-500: #737373  /* Base neutral */
--neutral-600: #525252  /* Dark neutral */
--neutral-700: #404040  /* Darker neutral */
--neutral-800: #262626  /* Very dark */
--neutral-900: #171717  /* Darkest neutral */
```

## Typography

### Font Stack
```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Type Scale
- **Display Large**: 4.5rem (72px) - Hero headings
- **Display Medium**: 3.75rem (60px) - Section headings
- **Display Small**: 3rem (48px) - Page headings
- **Headline Large**: 2.25rem (36px) - Card headings
- **Headline Medium**: 1.875rem (30px) - Subsection headings
- **Headline Small**: 1.5rem (24px) - Component headings
- **Title Large**: 1.25rem (20px) - Large body text
- **Title Medium**: 1.125rem (18px) - Medium body text
- **Title Small**: 1rem (16px) - Base body text
- **Label Large**: 0.875rem (14px) - Labels and captions
- **Label Medium**: 0.75rem (12px) - Small labels
- **Label Small**: 0.6875rem (11px) - Tiny labels

### Line Heights
- **Tight**: 1.25 (for headings)
- **Normal**: 1.5 (for body text)
- **Relaxed**: 1.75 (for long-form content)

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Spacing System

### Base Unit
- **Base**: 0.25rem (4px)

### Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Usage Guidelines
- **xs**: Tight spacing between related elements
- **sm**: Small gaps between components
- **md**: Standard spacing between sections
- **lg**: Large gaps between major sections
- **xl**: Extra large spacing for hero sections
- **2xl**: Maximum spacing for page-level sections
- **3xl**: Reserved for special cases

## Border Radius

### Scale
```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Standard elements */
--radius-lg: 0.75rem;    /* 12px - Cards and panels */
--radius-xl: 1rem;       /* 16px - Large cards */
--radius-2xl: 1.5rem;    /* 24px - Hero sections */
--radius-full: 9999px;   /* Pills and buttons */
```

### Usage Guidelines
- **sm**: Buttons, inputs, small badges
- **md**: Standard cards, modals
- **lg**: Large cards, panels
- **xl**: Hero sections, major containers
- **2xl**: Special emphasis elements
- **full**: Pills, rounded buttons, avatars

## Shadows

### Elevation Levels
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);                    /* Subtle elevation */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);  /* Standard elevation */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); /* High elevation */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); /* Very high elevation */
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);            /* Maximum elevation */
```

### Usage Guidelines
- **sm**: Subtle hover states, small cards
- **md**: Standard cards, dropdowns
- **lg**: Modals, large cards, navigation
- **xl**: Hero sections, major overlays
- **2xl**: Special emphasis, floating elements

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--secondary-50);
  color: var(--secondary-700);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid var(--secondary-200);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--secondary-100);
  border-color: var(--secondary-300);
}
```

### Cards

#### Standard Card
```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--secondary-200);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

#### Elevated Card
```css
.card-elevated {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border: none;
}
```

### Input Fields

#### Standard Input
```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--secondary-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}
```

### Modals

#### Standard Modal
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}
```

## Layout Principles

### Grid System
- **Mobile**: Single column layout
- **Tablet**: 2-column grid for cards
- **Desktop**: 3-4 column grid for optimal content density
- **Large Desktop**: Maximum 4 columns to maintain readability

### Container Sizes
- **Mobile**: Full width with 1rem padding
- **Tablet**: Full width with 1.5rem padding
- **Desktop**: Full width with 2rem padding
- **Maximum width**: 1280px (7xl) for content areas

### Breakpoints
- **sm**: 640px (tablet portrait)
- **md**: 768px (tablet landscape)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large desktop)

## Animation Guidelines

### Duration
- **Fast**: 150ms (micro-interactions)
- **Normal**: 200ms (standard transitions)
- **Slow**: 300ms (complex animations)

### Easing
- **Ease-out**: For elements appearing
- **Ease-in**: For elements disappearing
- **Ease-in-out**: For elements changing state

### Principles
- Respect user preferences (prefers-reduced-motion)
- Keep animations purposeful and meaningful
- Avoid excessive motion that distracts from content
- Use consistent timing across the application

## Accessibility Guidelines

### Color Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

### Focus Management
- All interactive elements must be keyboard accessible
- Focus indicators must be clearly visible
- Focus order should follow logical reading order
- Skip links for main content areas

### Screen Readers
- Use semantic HTML elements
- Provide meaningful alt text for images
- Use ARIA labels where necessary
- Ensure proper heading hierarchy

## Design Inspiration

### Modern Web Applications

1. **Linear** (linear.app)
   - Clean, minimalist interface
   - Excellent use of whitespace
   - Subtle animations and micro-interactions
   - Strong typography hierarchy

2. **Vercel** (vercel.com)
   - Modern gradient usage
   - Clean component design
   - Excellent mobile responsiveness
   - Strong brand consistency

3. **Stripe** (stripe.com)
   - Professional, trustworthy design
   - Excellent form design
   - Clear information hierarchy
   - Accessible color choices

### Key Takeaways
- **Simplicity**: Less is more - focus on essential elements
- **Consistency**: Use the design system consistently across all pages
- **Performance**: Optimize for speed and smooth interactions
- **Accessibility**: Design for everyone, including users with disabilities
- **Mobile-first**: Start with mobile and enhance for larger screens

## Implementation Notes

### CSS Custom Properties
All design tokens are implemented as CSS custom properties for easy theming and consistency.

### Responsive Design
Use mobile-first approach with progressive enhancement for larger screens.

### Dark Mode
All colors have dark mode variants that automatically switch based on user preference.

### Performance
- Use CSS-only animations where possible
- Optimize images and assets
- Implement lazy loading for non-critical content
- Minimize JavaScript for interactions

This design system provides the foundation for creating a modern, accessible, and beautiful user experience for AIStyleHub.
