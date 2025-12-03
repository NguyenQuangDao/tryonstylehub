interface UserInfo {
  gender: 'male' | 'female' | 'non-binary';
  height: number;
  weight: number;
  skinTone: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
  eyeColor: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
}

const QUALITY_KEYWORDS = [
  'photorealistic',
  'professional photography',
  'high quality',
  'high detail',
  'lifelike'
];

const COMPOSITION_KEYWORDS = [
  'subject centered',
  'full-body composition',
  'head-to-toe visible'
];

const CAMERA_KEYWORDS = [
  'DSLR',
  '50mm prime',
  'f/2.0',
  'ISO 200',
  '1/200s'
];

const LIGHTING_KEYWORDS = [
  'soft studio key light',
  'gentle rim light'
];

const BACKGROUND_KEYWORDS = [
  'neutral studio gradient background'
];

const NEGATIVE_KEYWORDS = [
  'no watermark',
  'no text',
  'no blur',
  'no distortion',
  'no cropping',
  'no cut-off head/hands/feet'
];

const skinToneMap: Record<UserInfo['skinTone'], string> = {
  'very-light': 'very fair skin tone',
  'light': 'fair skin tone',
  'medium': 'medium skin tone',
  'tan': 'tanned skin tone',
  'brown': 'brown skin tone',
  'dark': 'deep dark skin tone'
};

const hairColorMap: Record<UserInfo['hairColor'], string> = {
  'black': 'black',
  'brown': 'brown',
  'blonde': 'blonde',
  'red': 'red',
  'white': 'white',
  'gray': 'gray',
  'other': 'colorful'
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

  parts.push(`photorealistic full body portrait of a ${bodyType} ${gender}`);
  parts.push(`${skinToneMap[info.skinTone]}`);
  parts.push(`${hairColorMap[info.hairColor]} ${hairStyleMap[info.hairStyle]} hair`);
  parts.push(`${info.eyeColor} eyes`);
  parts.push(heightDesc);
  parts.push('natural standing pose, slight angle toward camera, relaxed hands at sides');

  parts.push(...COMPOSITION_KEYWORDS);
  parts.push(...CAMERA_KEYWORDS);
  parts.push(...LIGHTING_KEYWORDS);
  parts.push(...BACKGROUND_KEYWORDS);
  parts.push(...QUALITY_KEYWORDS);
  parts.push(...NEGATIVE_KEYWORDS);

  if (incomingPrompt && incomingPrompt.trim()) {
    const userTags = tokenize(incomingPrompt);
    const filtered = userTags.filter(tag => !/brand|logo|watermark|copyright|text/i.test(tag));
    parts.push(...filtered);
  }

  const final = dedupe(parts).join(', ');
  return clampLength(final, 700);
}

export function improveOnly(original: string): string {
  const base = [
    ...QUALITY_KEYWORDS,
    ...COMPOSITION_KEYWORDS,
    ...CAMERA_KEYWORDS,
    ...LIGHTING_KEYWORDS,
    ...BACKGROUND_KEYWORDS,
    ...NEGATIVE_KEYWORDS
  ];
  const parts = dedupe([...tokenize(original), ...base]);
  return clampLength(parts.join(', '), 700);
}
