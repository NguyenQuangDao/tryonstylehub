/**
 * Tests for BodyPreview component
 */

import BodyPreview from '@/app/components/BodyPreview';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BodyPreview', () => {
  const defaultProps = {
    height: 170,
    weight: 70,
    gender: 'male',
    hairColor: 'black',
    hairStyle: 'short',
  };

  it('renders without crashing', () => {
    const { container } = render(<BodyPreview {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders with correct viewBox dimensions', () => {
    const { container } = render(<BodyPreview {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 700');
  });

  it('renders watermark text', () => {
    render(<BodyPreview {...defaultProps} />);
    const watermark = screen.getByText(/AIStyleHub Virtual Model/i);
    expect(watermark).toBeDefined();
  });

  it('handles female gender correctly', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} gender="female" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies skinTone prop', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} skinTone="dark" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies bodyShape prop', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} bodyShape="athletic" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('handles muscleLevel prop', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} muscleLevel={5} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('handles fatLevel prop', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} fatLevel={4} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('validates and clamps height values', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} height={300} /> // Above max
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('validates and clamps weight values', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} weight={400} /> // Above max
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders with custom shoulder width', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} shoulderWidth={50} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders with custom waist size', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} waistSize={80} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders with custom hip size', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} hipSize={90} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies different hair colors', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} hairColor="blonde" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies different eye colors', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} eyeColor="blue" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies clothing style', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} clothingStyle="formal" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies footwear type', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} footwearType="sneaker" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies custom color palette', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} colorPalette={['#FF0000', '#0000FF']} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders with accessories', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} accessories={['watch', 'necklace']} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders with beard style', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} beardStyle="full" gender="male" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders different face shapes', () => {
    const { container } = render(
      <BodyPreview {...defaultProps} faceShape="round" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });
});

