import { describe, it, expect } from 'vitest';
import { getRangeCues, getPoseCue, getVietnameseSummary } from '../promptOptions';

describe('promptOptions', () => {
  it('returns full body cues', () => {
    const cues = getRangeCues('full-body');
    expect(cues).toContain('full body portrait');
    expect(cues).toContain('head-to-toe visible');
  });

  it('returns upper body cues', () => {
    const cues = getRangeCues('upper-body');
    expect(cues).toContain('upper body portrait');
    expect(cues).toContain('from head to mid-torso visible');
  });

  it('returns pose cues', () => {
    expect(getPoseCue('standing')).toContain('standing');
    expect(getPoseCue('walking')).toContain('walking');
  });

  it('builds Vietnamese summary', () => {
    const vi = getVietnameseSummary('full-body', 'hands-on-hips');
    expect(vi).toContain('Phạm vi: Toàn thân');
    expect(vi).toContain('Đặt tay lên hông');
    expect(vi).toContain('grayscale');
  });
});
