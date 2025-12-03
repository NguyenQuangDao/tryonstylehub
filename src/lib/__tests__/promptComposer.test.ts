import { describe, it, expect } from 'vitest';
import { composePromptFromAll, improveOnly } from '../promptComposer';

const baseInfo = {
  gender: 'female' as const,
  height: 168,
  weight: 56,
  skinTone: 'light' as const,
  eyeColor: 'blue' as const,
  hairColor: 'brown' as const,
  hairStyle: 'long' as const,
};

describe('promptComposer', () => {
  it('composes prompt from user info with defaults', () => {
    const out = composePromptFromAll(baseInfo);
    expect(out).toContain('photorealistic');
    expect(out).toContain('full body');
    expect(out).toContain('blue eyes');
    expect(out).toContain('brown long hair');
    expect(out.length).toBeLessThanOrEqual(700);
  });

  it('integrates incoming description and dedupes', () => {
    const input = 'photorealistic, professional photography, neutral studio background, relaxed hands';
    const out = composePromptFromAll(baseInfo, input);
    expect(out).toContain('neutral studio');
    // Ensure dedupe removed duplicated quality keywords
    const occurrences = (out.match(/photorealistic/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it('improves only original prompt', () => {
    const input = 'young woman smiling, outdoor portrait';
    const out = improveOnly(input);
    expect(out).toContain('DSLR');
    expect(out).toContain('subject centered');
    expect(out.length).toBeLessThanOrEqual(700);
  });
});

