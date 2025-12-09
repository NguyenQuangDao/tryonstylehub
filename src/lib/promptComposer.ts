interface UserInfo {
  gender: 'male' | 'female' | 'non-binary';
  height: number;
  weight: number;
  skinTone: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
  eyeColor: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
}

const GROUP_TERMS = [
  'two\\s+people', 'three\\s+people', '\\d+\\s*people', 'multiple\\s+subjects', 'additional\\s+figures', 'extra\\s+person',
  'group', 'couple', 'multiple', 'crowd', 'several', 'friends', 'team', 'family', 'children', 'kids',
  'men\\s+and\\s+women', 'boys\\s+and\\s+girls',
  'nhóm', 'cặp', 'đôi', 'hai\\s+người', '2\\s*người', 'ba\\s+người', '3\\s*người', 'nhiều\\s+người',
  'đám\\s+đông', 'tập\\s+thể', 'gia\\s+đình', 'bạn\\s+bè', 'song\\s+sinh', 'bộ\\s+ba', 'bộ\\s+đôi',
  'nam\\s+và\\s+nữ', 'con\\s+trai\\s+và\\s+con\\s+gái', '\\d+\\s*người'
];
const GROUP_BLACKLIST = new RegExp(`(?:${GROUP_TERMS.join('|')})`, 'i');

function removeGroupTerms(text: string): string {
  // remove all group mentions and numeric-people patterns
  let t = text.replace(GROUP_BLACKLIST, '');
  t = t.replace(/\b(\d+)\s*(people|persons|người)\b/gi, '');
  return t.replace(/\s{2,}/g, ' ').trim();
}

const STRUCTURE_KEYWORDS = [
  'grayscale',
  'high-contrast',
  'edge-emphasized',
  'contour-focused',
  'shape-based representation',
  'structural morphology',
  'rotation-invariant depiction',
  'camera-agnostic orientation',
  'normalized exposure',
  'denoised',
  'artifact-free'
];

const COMPOSITION_KEYWORDS = [
  'subject centered',
  'full-body composition',
  'head-to-toe visible',
  'single subject only',
  'one person',
  'solo portrait',
  'single frame',
  'plain neutral background',
  'uncluttered background'
];

// Camera, lighting, and background cues removed to ensure independence

const NEGATIVE_KEYWORDS = [
  'no watermark',
  'no text',
  'no blur',
  'no distortion',
  'no cropping',
  'no cut-off head/hands/feet',
  'no collage',
  'no multiple panels',
  'no split-screen',
  'no multi-view',
  'no multiple angles',
  'no orthographic views',
  'no front/side/back layout',
  'no top-bottom layout',
  'no diagram',
  'no labels or annotations',
  'no measurement lines',
  'no grid overlay',
  'no text blocks',
  'no infographic layout',
  'no reference sheet'
];

const FEMALE_NEGATIVE = [
  'no beard',
  'no mustache',
  'no stubble',
  'no chest hair'
];
const MALE_NEGATIVE: string[] = [];
const NB_NEGATIVE = [
  'no beard',
  'no mustache',
  'no stubble'
];

function genderSilhouette(gender: UserInfo['gender']): string {
  if (gender === 'female') return 'feminine body silhouette';
  if (gender === 'male') return 'masculine body silhouette';
  return 'androgynous body silhouette';
}

// Color-dependent descriptors removed
const skinToneMap: Record<UserInfo['skinTone'], string> = {
  'very-light': '',
  'light': '',
  'medium': '',
  'tan': '',
  'brown': '',
  'dark': ''
};

const hairColorMap: Record<UserInfo['hairColor'], string> = {
  'black': '',
  'brown': '',
  'blonde': '',
  'red': '',
  'white': '',
  'gray': '',
  'other': ''
};

const hairStyleMap: Record<UserInfo['hairStyle'], string> = {
  'long': 'long',
  'short': 'short',
  'curly': 'curly',
  'straight': 'straight',
  'bald': 'bald',
  'wavy': 'wavy'
};

function describeBodyType(h: number, w: number): string {
  const m = h / 100;
  const bmi = w / (m * m);
  if (bmi < 18.5) return 'slender build';
  if (bmi < 24.9) return 'average build';
  if (bmi < 29.9) return 'athletic/curvy build';
  return 'plus-size build';
}

function describeHeightImpression(h: number): string {
  if (h <= 155) return 'short stature';
  if (h >= 185) return 'tall stature';
  return 'average height';
}

function genderTerm(gender: UserInfo['gender']): string {
  return gender === 'male' ? 'man' : gender === 'female' ? 'woman' : 'person';
}

function tokenize(text: string): string[] {
  const normalized = text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[.;]+/g, ',')
    .trim();
  return normalized
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function dedupe(tags: string[]): string[] {
  // Prefer longer, more specific phrases first
  const sorted = [...tags].sort((a, b) => b.length - a.length);
  const result: string[] = [];
  for (const t of sorted) {
    const lc = t.toLowerCase();
    const overlaps = result.some(r => r.toLowerCase().includes(lc) || lc.includes(r.toLowerCase()));
    if (overlaps) continue;
    result.push(t);
  }
  // Restore a stable, readable order: keep subject-first terms at front when possible
  return result;
}

function clampLength(text: string, maxChars = 600): string {
  if (text.length <= maxChars) return text;
  // Hard clamp, prefer cutting at delimiter
  const idx = text.lastIndexOf(',', maxChars);
  return (idx > 0 ? text.slice(0, idx) : text.slice(0, maxChars)).trim();
}

export function composePromptFromAll(info: UserInfo, incomingPrompt?: string): string {
  const parts: string[] = [];

  const heightDesc = describeHeightImpression(info.height);
  const bodyType = describeBodyType(info.height, info.weight);
  const gender = genderTerm(info.gender);

  parts.push(`full body depiction of an adult ${gender}`);
  parts.push(genderSilhouette(info.gender));
  parts.push(`${bodyType}`);
  const hairSilhouette = hairStyleMap[info.hairStyle] ? `${hairStyleMap[info.hairStyle]} hair silhouette` : '';
  if (hairSilhouette) parts.push(hairSilhouette);
  parts.push('neutral facial structure');
  parts.push(heightDesc);
  parts.push('natural standing pose, front-facing orientation, canonical upright alignment, relaxed hands at sides');

  parts.push(...COMPOSITION_KEYWORDS);
  parts.push(...STRUCTURE_KEYWORDS);
  parts.push(...NEGATIVE_KEYWORDS);
  if (info.gender === 'female') parts.push(...FEMALE_NEGATIVE);
  if (info.gender === 'non-binary') parts.push(...NB_NEGATIVE);

  if (incomingPrompt && incomingPrompt.trim()) {
    const userTags = tokenize(removeGroupTerms(incomingPrompt));
    const filtered = userTags.filter(tag => !/brand|logo|watermark|copyright|text|background|studio|DSLR|lens|f\/|ISO|lighting|key light|rim light|color|skin tone|eye color/i.test(tag) && !GROUP_BLACKLIST.test(tag));
    parts.push(...filtered);
  }

  const final = dedupe(parts).filter(Boolean).join(', ');
  return clampLength(final, 700);
}

export function improveOnly(original: string): string {
  const base = [
    ...COMPOSITION_KEYWORDS,
    ...STRUCTURE_KEYWORDS,
    ...NEGATIVE_KEYWORDS
  ];
  const cleaned = removeGroupTerms(original);
  const parts = dedupe([...tokenize(cleaned), ...base]);
  return clampLength(parts.join(', '), 700);
}
