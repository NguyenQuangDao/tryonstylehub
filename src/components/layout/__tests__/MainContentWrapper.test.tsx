import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MainContentWrapper from '../MainContentWrapper';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';

describe('MainContentWrapper', () => {
  it('applies ml-0 on login page', () => {
    (usePathname as any).mockReturnValue('/login');
    render(
      <MainContentWrapper>
        <div data-testid="child">Child</div>
      </MainContentWrapper>
    );
    // The wrapper is the div directly containing the child
    // However, since we rendered MainContentWrapper > div, the parent of div is the wrapper
    const child = screen.getByTestId('child');
    const wrapper = child.parentElement;
    expect(wrapper?.className).toContain('ml-0');
    expect(wrapper?.className).not.toContain('ml-64');
  });

  it('applies ml-0 on register page', () => {
    (usePathname as any).mockReturnValue('/register');
    render(
      <MainContentWrapper>
        <div data-testid="child">Child</div>
      </MainContentWrapper>
    );
    const child = screen.getByTestId('child');
    const wrapper = child.parentElement;
    expect(wrapper?.className).toContain('ml-0');
    expect(wrapper?.className).not.toContain('ml-64');
  });

  it('applies ml-64 on other pages', () => {
    (usePathname as any).mockReturnValue('/dashboard');
    render(
      <MainContentWrapper>
        <div data-testid="child">Child</div>
      </MainContentWrapper>
    );
    const child = screen.getByTestId('child');
    const wrapper = child.parentElement;
    expect(wrapper?.className).toContain('ml-64');
    expect(wrapper?.className).not.toContain('ml-0');
  });
});
