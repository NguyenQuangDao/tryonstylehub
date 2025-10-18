'use client';

interface BodyPreviewProps {
  height: number;
  weight: number;
  gender: string;
  bodyShape?: string;
  skinTone?: string;
  hairColor: string;
  hairStyle: string;
  muscleLevel?: number;
  fatLevel?: number;
  shoulderWidth?: number;
  waistSize?: number;
  hipSize?: number;
  legLength?: number;
  eyeColor?: string;
  faceShape?: string;
  beardStyle?: string;
  tattoos?: string;
  piercings?: string;
  clothingStyle?: string;
  accessories?: string[];
  footwearType?: string;
  colorPalette?: string[];
  ageAppearance?: number;
  bodyProportionPreset?: string;
}

export default function BodyPreview({
  height,
  weight,
  gender,
  bodyShape = '',
  skinTone = 'medium',
  hairColor,
  hairStyle,
  muscleLevel = 3,
  fatLevel = 3,
  shoulderWidth,
  waistSize,
  hipSize,
  legLength,
  eyeColor = 'brown',
  faceShape = 'oval',
  beardStyle = 'none',
  tattoos,
  piercings,
  clothingStyle = 'casual',
  accessories,
  footwearType,
  colorPalette,
  ageAppearance,
  bodyProportionPreset,
}: BodyPreviewProps) {
  // Proportions calculation
  const bmi = weight / Math.pow(height / 100, 2);
  
  const getBodyWidthFactor = () => {
    let factor = 1;
    if (bodyShape === 'slim') factor = 0.8;
    else if (bodyShape === 'athletic') factor = 1.05;
    else if (bodyShape === 'balanced') factor = 1;
    else if (bodyShape === 'muscular') factor = 1.2;
    else if (bodyShape === 'curvy') factor = 1.15;
    else if (bodyShape === 'plus-size') factor = 1.45;
    else if (bmi < 18.5) factor = 0.85;
    else if (bmi >= 25 && bmi < 30) factor = 1.2;
    else if (bmi >= 30) factor = 1.4;
    
    if (fatLevel) factor += (fatLevel - 3) * 0.06;
    return Math.max(0.7, Math.min(1.8, factor));
  };

  const bodyFactor = getBodyWidthFactor();
  const muscleFactor = muscleLevel ? 0.9 + (muscleLevel * 0.05) : 1;

  // Colors
  const skinColors: Record<string, string> = {
    'very-light': '#FFDFC4',
    'light': '#F0D5BE',
    'medium': '#D1A684',
    'tan': '#C68642',
    'brown': '#8D5524',
    'dark': '#5D4037',
  };
  const skinColor = skinColors[skinTone] || skinColors['medium'];
  const skinShadow = `${skinColor}99`;

  const hairColors: Record<string, string> = {
    'black': '#2C2C2C', 'brown': '#6F4E37', 'blonde': '#F4DCA8',
    'red': '#C1440E', 'white': '#F5F5F5', 'gray': '#9E9E9E',
    'purple': '#8B4789', 'blue': '#4A7C9E', 'green': '#5A7C4E',
    'pink': '#FFB6C1', 'other': '#FF6B9D',
  };
  const hairColor1 = hairColors[hairColor] || hairColors['black'];

  const eyeColors: Record<string, string> = {
    'brown': '#8B6F47', 'black': '#1A1A1A', 'blue': '#5B9BD5',
    'green': '#70AD47', 'gray': '#A0A0A0', 'amber': '#D97706', 'hazel': '#8B7355',
  };
  const eyeColor1 = eyeColors[eyeColor] || eyeColors['brown'];

  const topColor = (colorPalette && colorPalette[0]) || 
    { sport: '#60A5FA', elegant: '#374151', street: '#F87171', gothic: '#18181B',
      casual: '#94A3B8', business: '#3B82F6', formal: '#1E293B', bohemian: '#F59E0B',
      vintage: '#92400E', preppy: '#EF4444', minimalist: '#6B7280' }[clothingStyle] || '#94A3B8';
  
  const pantsColor = (colorPalette && colorPalette[1]) || '#334155';
  
  const shoeColor = {
    sneaker: '#F5F5F5', heels: '#1A1A1A', boots: '#2C3E50',
    sandals: '#8B6F47', formal: '#000000', loafers: '#8B6F47',
    flats: '#C19A6B', slippers: '#BDBDBD'
  }[footwearType || ''] || '#334155';

  // SVG dimensions
  const W = 400;
  const H = 700;
  const cx = W / 2;
  
  // Anatomical proportions (8-head canon)
  const unit = H / 9;
  const headR = unit * 0.65;
  
  // Y positions
  const y = {
    head: unit * 0.75,
    neck: unit * 1.15,
    shoulders: unit * 1.55,
    chest: unit * 2.6,
    waist: unit * 3.6,
    hips: unit * 4.6,
    crotch: unit * 5,
    knee: unit * 6.5,
    ankle: unit * 8.1,
    feet: unit * 8.5,
  };

  // Widths
  const base = unit * 1.1 * bodyFactor;
  const shoulderW = shoulderWidth ? (shoulderWidth / height) * W * 2.5 : base * 1.65 * muscleFactor;
  const chestW = base * 1.4 * muscleFactor;
  const waistW = waistSize ? (waistSize / height) * W * 2.2 : base * 1;
  const hipW = hipSize ? (hipSize / height) * W * 2.3 : gender === 'female' ? base * 1.35 : base * 1.15;
  const thighW = base * 0.5;
  const kneeW = base * 0.42;
  const ankleW = base * 0.32;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Advanced Gradients */}
        <radialGradient id="skinRadial" cx="40%" cy="40%">
          <stop offset="0%" stopColor={skinColor} stopOpacity="1" />
          <stop offset="70%" stopColor={skinColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>

        <linearGradient id="skinLinear" x1="0%" x2="100%">
          <stop offset="0%" stopColor={skinShadow} />
          <stop offset="50%" stopColor={skinColor} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>

        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={topColor} />
          <stop offset="50%" stopColor={topColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={topColor} stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={pantsColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={pantsColor} stopOpacity="0.8" />
        </linearGradient>

        <radialGradient id="floorShadow">
          <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="hairGrad" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={hairColor1} stopOpacity="1" />
          <stop offset="100%" stopColor={hairColor1} stopOpacity="0.9" />
        </linearGradient>

        <filter id="softGlow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="#FAFBFC" />
      
      {/* Floor Shadow */}
      <ellipse cx={cx} cy={y.feet + 20} rx={base * 2.5} ry="15" fill="url(#floorShadow)" />

      {/* === LEGS (Back) === */}
      {/* Left Leg - Pants */}
      <path
        d={`M ${cx - hipW / 2 + 8} ${y.hips}
            C ${cx - thighW - 5} ${y.crotch + 20}, ${cx - thighW} ${y.knee - 30}, ${cx - thighW} ${y.knee}
            C ${cx - kneeW - 2} ${y.knee + 15}, ${cx - kneeW} ${y.ankle - 15}, ${cx - ankleW - 3} ${y.ankle}
            L ${cx - ankleW + 5} ${y.ankle}
            C ${cx - kneeW + 5} ${y.ankle - 15}, ${cx - kneeW + 8} ${y.knee + 15}, ${cx - thighW + 15} ${y.knee}
            C ${cx - thighW + 15} ${y.knee - 30}, ${cx - thighW + 18} ${y.crotch + 20}, ${cx - 3} ${y.hips}
            Z`}
        fill="url(#pantsGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Right Leg - Pants */}
      <path
        d={`M ${cx + hipW / 2 - 8} ${y.hips}
            C ${cx + thighW + 5} ${y.crotch + 20}, ${cx + thighW} ${y.knee - 30}, ${cx + thighW} ${y.knee}
            C ${cx + kneeW + 2} ${y.knee + 15}, ${cx + kneeW} ${y.ankle - 15}, ${cx + ankleW + 3} ${y.ankle}
            L ${cx + ankleW - 5} ${y.ankle}
            C ${cx + kneeW - 5} ${y.ankle - 15}, ${cx + kneeW - 8} ${y.knee + 15}, ${cx + thighW - 15} ${y.knee}
            C ${cx + thighW - 15} ${y.knee - 30}, ${cx + thighW - 18} ${y.crotch + 20}, ${cx + 3} ${y.hips}
            Z`}
        fill="url(#pantsGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Knee highlights */}
      <ellipse cx={cx - thighW + 8} cy={y.knee} rx="10" ry="6" fill="#fff" opacity="0.08" />
      <ellipse cx={cx + thighW - 8} cy={y.knee} rx="10" ry="6" fill="#fff" opacity="0.08" />

      {/* === SHOES === */}
      {footwearType === 'heels' ? (
        <>
          <g filter="url(#softGlow)">
            <ellipse cx={cx - ankleW} cy={y.feet - 5} rx="16" ry="7" fill={shoeColor} stroke="#000" strokeWidth="1.2" />
            <path d={`M ${cx - ankleW} ${y.feet - 5} L ${cx - ankleW + 2} ${y.feet + 15}`} stroke={shoeColor} strokeWidth="4" strokeLinecap="round" />
          </g>
          <g filter="url(#softGlow)">
            <ellipse cx={cx + ankleW} cy={y.feet - 5} rx="16" ry="7" fill={shoeColor} stroke="#000" strokeWidth="1.2" />
            <path d={`M ${cx + ankleW} ${y.feet - 5} L ${cx + ankleW - 2} ${y.feet + 15}`} stroke={shoeColor} strokeWidth="4" strokeLinecap="round" />
          </g>
        </>
      ) : footwearType === 'boots' ? (
        <>
          <rect x={cx - ankleW - 10} y={y.ankle - 35} width="24" height="42" rx="4" fill={shoeColor} stroke="#000" strokeWidth="1.2" filter="url(#softGlow)" />
          <rect x={cx + ankleW - 14} y={y.ankle - 35} width="24" height="42" rx="4" fill={shoeColor} stroke="#000" strokeWidth="1.2" filter="url(#softGlow)" />
        </>
      ) : (
        <>
          <ellipse cx={cx - ankleW} cy={y.feet} rx="17" ry="8" fill={shoeColor} stroke="#000" strokeWidth="1.2" filter="url(#softGlow)" />
          <ellipse cx={cx + ankleW} cy={y.feet} rx="17" ry="8" fill={shoeColor} stroke="#000" strokeWidth="1.2" filter="url(#softGlow)" />
        </>
      )}

      {/* === TORSO === */}
      <path
        d={`M ${cx - shoulderW / 2} ${y.shoulders}
            C ${cx - chestW / 2 - 3} ${y.shoulders + 25}, ${cx - chestW / 2} ${y.chest - 15}, ${cx - chestW / 2} ${y.chest}
            C ${cx - waistW / 2 - 4} ${y.chest + 20}, ${cx - waistW / 2} ${y.waist - 10}, ${cx - waistW / 2} ${y.waist}
            C ${cx - hipW / 2 - 2} ${y.waist + 18}, ${cx - hipW / 2} ${y.hips - 10}, ${cx - hipW / 2} ${y.hips}
            L ${cx + hipW / 2} ${y.hips}
            C ${cx + hipW / 2} ${y.hips - 10}, ${cx + hipW / 2 + 2} ${y.waist + 18}, ${cx + waistW / 2} ${y.waist}
            C ${cx + waistW / 2} ${y.waist - 10}, ${cx + waistW / 2 + 4} ${y.chest + 20}, ${cx + chestW / 2} ${y.chest}
            C ${cx + chestW / 2} ${y.chest - 15}, ${cx + chestW / 2 + 3} ${y.shoulders + 25}, ${cx + shoulderW / 2} ${y.shoulders}
            Z`}
        fill="url(#topGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#softGlow)"
      />

      {/* Torso shading for depth */}
      <ellipse cx={cx - chestW / 4} cy={y.chest} rx="18" ry="22" fill="#000" opacity="0.06" />
      <ellipse cx={cx + chestW / 4} cy={y.chest} rx="18" ry="22" fill="#000" opacity="0.06" />
      <ellipse cx={cx} cy={y.waist} rx={waistW / 3} ry="15" fill="#000" opacity="0.04" />

      {/* === ARMS === */}
      {/* Left Arm */}
      <path
        d={`M ${cx - shoulderW / 2 + 5} ${y.shoulders + 8}
            C ${cx - shoulderW / 2 - 8} ${y.shoulders + 35}, ${cx - shoulderW / 2 - 12} ${y.chest}, ${cx - shoulderW / 2 - 14} ${y.chest + 30}
            C ${cx - shoulderW / 2 - 15} ${y.chest + 55}, ${cx - shoulderW / 2 - 14} ${y.waist - 10}, ${cx - shoulderW / 2 - 12} ${y.waist + 15}
            L ${cx - shoulderW / 2 - 8} ${y.waist + 15}
            C ${cx - shoulderW / 2 - 10} ${y.waist - 10}, ${cx - shoulderW / 2 - 11} ${y.chest + 55}, ${cx - shoulderW / 2 - 10} ${y.chest + 30}
            C ${cx - shoulderW / 2 - 8} ${y.chest}, ${cx - shoulderW / 2 - 4} ${y.shoulders + 35}, ${cx - shoulderW / 2 + 3} ${y.shoulders + 12}
            Z`}
        fill="url(#topGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#softGlow)"
      />

      {/* Left Forearm (skin) */}
      <path
        d={`M ${cx - shoulderW / 2 - 12} ${y.waist + 20}
            C ${cx - shoulderW / 2 - 10} ${y.waist + 55}, ${cx - shoulderW / 2 - 9} ${y.hips - 5}, ${cx - shoulderW / 2 - 8} ${y.hips + 25}
            L ${cx - shoulderW / 2 - 5} ${y.hips + 25}
            C ${cx - shoulderW / 2 - 6} ${y.hips - 5}, ${cx - shoulderW / 2 - 7} ${y.waist + 55}, ${cx - shoulderW / 2 - 9} ${y.waist + 20}
            Z`}
        fill="url(#skinLinear)"
        stroke="#1A1A1A"
        strokeWidth="1.3"
        strokeLinejoin="round"
        filter="url(#softGlow)"
      />

      {/* Left Hand */}
      <g filter="url(#softGlow)">
        <ellipse cx={cx - shoulderW / 2 - 6.5} cy={y.hips + 32} rx="9" ry="11" fill="url(#skinRadial)" stroke="#1A1A1A" strokeWidth="1.2" />
        <path d={`M ${cx - shoulderW / 2 - 10} ${y.hips + 32} L ${cx - shoulderW / 2 - 11} ${y.hips + 40}`} stroke="#1A1A1A" strokeWidth="1" opacity="0.6" />
        <path d={`M ${cx - shoulderW / 2 - 6} ${y.hips + 32} L ${cx - shoulderW / 2 - 6} ${y.hips + 40}`} stroke="#1A1A1A" strokeWidth="1" opacity="0.6" />
        <path d={`M ${cx - shoulderW / 2 - 2} ${y.hips + 32} L ${cx - shoulderW / 2 - 1} ${y.hips + 39}`} stroke="#1A1A1A" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Right Arm */}
      <path
        d={`M ${cx + shoulderW / 2 - 5} ${y.shoulders + 8}
            C ${cx + shoulderW / 2 + 8} ${y.shoulders + 35}, ${cx + shoulderW / 2 + 12} ${y.chest}, ${cx + shoulderW / 2 + 14} ${y.chest + 30}
            C ${cx + shoulderW / 2 + 15} ${y.chest + 55}, ${cx + shoulderW / 2 + 14} ${y.waist - 10}, ${cx + shoulderW / 2 + 12} ${y.waist + 15}
            L ${cx + shoulderW / 2 + 8} ${y.waist + 15}
            C ${cx + shoulderW / 2 + 10} ${y.waist - 10}, ${cx + shoulderW / 2 + 11} ${y.chest + 55}, ${cx + shoulderW / 2 + 10} ${y.chest + 30}
            C ${cx + shoulderW / 2 + 8} ${y.chest}, ${cx + shoulderW / 2 + 4} ${y.shoulders + 35}, ${cx + shoulderW / 2 - 3} ${y.shoulders + 12}
            Z`}
        fill="url(#topGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#softGlow)"
      />

      {/* Right Forearm (skin) */}
      <path
        d={`M ${cx + shoulderW / 2 + 12} ${y.waist + 20}
            C ${cx + shoulderW / 2 + 10} ${y.waist + 55}, ${cx + shoulderW / 2 + 9} ${y.hips - 5}, ${cx + shoulderW / 2 + 8} ${y.hips + 25}
            L ${cx + shoulderW / 2 + 5} ${y.hips + 25}
            C ${cx + shoulderW / 2 + 6} ${y.hips - 5}, ${cx + shoulderW / 2 + 7} ${y.waist + 55}, ${cx + shoulderW / 2 + 9} ${y.waist + 20}
            Z`}
        fill="url(#skinLinear)"
        stroke="#1A1A1A"
        strokeWidth="1.3"
        strokeLinejoin="round"
        filter="url(#softGlow)"
      />

      {/* Right Hand */}
      <g filter="url(#softGlow)">
        <ellipse cx={cx + shoulderW / 2 + 6.5} cy={y.hips + 32} rx="9" ry="11" fill="url(#skinRadial)" stroke="#1A1A1A" strokeWidth="1.2" />
        <path d={`M ${cx + shoulderW / 2 + 10} ${y.hips + 32} L ${cx + shoulderW / 2 + 11} ${y.hips + 40}`} stroke="#1A1A1A" strokeWidth="1" opacity="0.6" />
        <path d={`M ${cx + shoulderW / 2 + 6} ${y.hips + 32} L ${cx + shoulderW / 2 + 6} ${y.hips + 40}`} stroke="#1A1A1A" strokeWidth="1" opacity="0.6" />
        <path d={`M ${cx + shoulderW / 2 + 2} ${y.hips + 32} L ${cx + shoulderW / 2 + 1} ${y.hips + 39}`} stroke="#1A1A1A" strokeWidth="1" opacity="0.6" />
      </g>

      {/* === NECK === */}
      <path
        d={`M ${cx - headR * 0.35} ${y.neck - 5}
            C ${cx - headR * 0.4} ${y.neck + 8}, ${cx - headR * 0.42} ${y.shoulders - 5}, ${cx - headR * 0.45} ${y.shoulders}
            L ${cx + headR * 0.45} ${y.shoulders}
            C ${cx + headR * 0.42} ${y.shoulders - 5}, ${cx + headR * 0.4} ${y.neck + 8}, ${cx + headR * 0.35} ${y.neck - 5}
            Z`}
        fill="url(#skinLinear)"
        stroke="#1A1A1A"
        strokeWidth="1.2"
        strokeLinejoin="round"
        filter="url(#softGlow)"
      />

      {/* === HEAD === */}
      {faceShape === 'round' ? (
        <circle cx={cx} cy={y.head} r={headR} fill="url(#skinRadial)" stroke="#1A1A1A" strokeWidth="2" filter="url(#softGlow)" />
      ) : faceShape === 'square' ? (
        <rect x={cx - headR * 0.9} y={y.head - headR} width={headR * 1.8} height={headR * 2} rx="12" fill="url(#skinRadial)" stroke="#1A1A1A" strokeWidth="2" filter="url(#softGlow)" />
      ) : faceShape === 'long' ? (
        <ellipse cx={cx} cy={y.head} rx={headR * 0.8} ry={headR * 1.15} fill="url(#skinRadial)" stroke="#1A1A1A" strokeWidth="2" filter="url(#softGlow)" />
      ) : faceShape === 'heart' ? (
        <path
          d={`M ${cx} ${y.head - headR * 0.95}
              C ${cx - headR * 0.7} ${y.head - headR * 0.6}, ${cx - headR * 0.85} ${y.head - headR * 0.2}, ${cx - headR * 0.75} ${y.head + headR * 0.3}
              Q ${cx - headR * 0.4} ${y.head + headR * 0.85}, ${cx} ${y.head + headR}
              Q ${cx + headR * 0.4} ${y.head + headR * 0.85}, ${cx + headR * 0.75} ${y.head + headR * 0.3}
              C ${cx + headR * 0.85} ${y.head - headR * 0.2}, ${cx + headR * 0.7} ${y.head - headR * 0.6}, ${cx} ${y.head - headR * 0.95}
              Z`}
          fill="url(#skinRadial)"
          stroke="#1A1A1A"
          strokeWidth="2"
          filter="url(#softGlow)"
        />
      ) : (
        <ellipse cx={cx} cy={y.head} rx={headR * 0.88} ry={headR} fill="url(#skinRadial)" stroke="#1A1A1A" strokeWidth="2" filter="url(#softGlow)" />
      )}

      {/* Neck shadow */}
      <ellipse cx={cx} cy={y.neck} rx={headR * 0.35} ry="5" fill="#000" opacity="0.08" />

      {/* === EARS === */}
      <g filter="url(#softGlow)">
        <ellipse cx={cx - headR * 0.88} cy={y.head + 3} rx="7" ry="12" fill={skinColor} stroke="#1A1A1A" strokeWidth="1.2" />
        <ellipse cx={cx - headR * 0.88} cy={y.head + 5} rx="3" ry="5" fill={skinShadow} opacity="0.4" />
        
        <ellipse cx={cx + headR * 0.88} cy={y.head + 3} rx="7" ry="12" fill={skinColor} stroke="#1A1A1A" strokeWidth="1.2" />
        <ellipse cx={cx + headR * 0.88} cy={y.head + 5} rx="3" ry="5" fill={skinShadow} opacity="0.4" />
      </g>

      {/* === HAIR === */}
      <g filter="url(#softGlow)">
        {hairStyle === 'long' && (
          <g>
            <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 1.05} ry={headR * 0.75} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
            <path
              d={`M ${cx - headR * 0.85} ${y.head - headR * 0.1}
                  C ${cx - headR * 0.9} ${y.shoulders + 30}, ${cx - headR * 0.88} ${y.chest + 10}, ${cx - headR * 0.82} ${y.chest + 50}
                  L ${cx - headR * 0.68} ${y.chest + 50}
                  C ${cx - headR * 0.74} ${y.chest + 10}, ${cx - headR * 0.76} ${y.shoulders + 30}, ${cx - headR * 0.72} ${y.head - headR * 0.1}
                  Z`}
              fill="url(#hairGrad)"
              stroke="#1A1A1A"
              strokeWidth="1.3"
            />
            <path
              d={`M ${cx + headR * 0.85} ${y.head - headR * 0.1}
                  C ${cx + headR * 0.9} ${y.shoulders + 30}, ${cx + headR * 0.88} ${y.chest + 10}, ${cx + headR * 0.82} ${y.chest + 50}
                  L ${cx + headR * 0.68} ${y.chest + 50}
                  C ${cx + headR * 0.74} ${y.chest + 10}, ${cx + headR * 0.76} ${y.shoulders + 30}, ${cx + headR * 0.72} ${y.head - headR * 0.1}
                  Z`}
              fill="url(#hairGrad)"
              stroke="#1A1A1A"
              strokeWidth="1.3"
            />
          </g>
        )}

        {(hairStyle === 'short' || hairStyle === 'buzz-cut') && (
          <path
            d={`M ${cx - headR * 0.85} ${y.head - headR * 0.4}
                Q ${cx} ${y.head - headR * 1.05} ${cx + headR * 0.85} ${y.head - headR * 0.4}
                Q ${cx + headR * 0.92} ${y.head - headR * 0.2}, ${cx + headR * 0.92} ${y.head + headR * 0.05}
                Q ${cx + headR * 0.85} ${y.head + headR * 0.25}, ${cx + headR * 0.7} ${y.head + headR * 0.35}
                L ${cx - headR * 0.7} ${y.head + headR * 0.35}
                Q ${cx - headR * 0.85} ${y.head + headR * 0.25}, ${cx - headR * 0.92} ${y.head + headR * 0.05}
                Q ${cx - headR * 0.92} ${y.head - headR * 0.2}, ${cx - headR * 0.85} ${y.head - headR * 0.4}
                Z`}
            fill="url(#hairGrad)"
            stroke="#1A1A1A"
            strokeWidth={hairStyle === 'buzz-cut' ? "1" : "1.6"}
            opacity={hairStyle === 'buzz-cut' ? "0.85" : "1"}
          />
        )}

        {hairStyle === 'medium' && (
          <g>
            <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 1.02} ry={headR * 0.72} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
            <path d={`M ${cx - headR * 0.82} ${y.head} L ${cx - headR * 0.78} ${y.shoulders - 15} L ${cx - headR * 0.68} ${y.shoulders - 15} L ${cx - headR * 0.7} ${y.head} Z`} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.2" />
            <path d={`M ${cx + headR * 0.82} ${y.head} L ${cx + headR * 0.78} ${y.shoulders - 15} L ${cx + headR * 0.68} ${y.shoulders - 15} L ${cx + headR * 0.7} ${y.head} Z`} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.2" />
          </g>
        )}

        {(hairStyle === 'curly' || hairStyle === 'wavy') && (
          <g>
            <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 1.1} ry={headR * 0.78} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx={cx - headR * 0.7 + i * (headR * 0.2)} cy={y.head - headR * 0.65 + (i % 2) * 8} r="6" fill={hairColor1} opacity="0.5" />
            ))}
          </g>
        )}

        {hairStyle === 'ponytail' && (
          <g>
            <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 0.95} ry={headR * 0.65} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
            <ellipse cx={cx} cy={y.head - headR * 0.85} rx="13" ry="18" fill={hairColor1} stroke="#1A1A1A" strokeWidth="1.5" />
            <ellipse cx={cx} cy={y.head - headR * 1.15} rx="10" ry="25" fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.3" />
          </g>
        )}

        {hairStyle === 'bun' && (
          <g>
            <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 0.95} ry={headR * 0.65} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
            <circle cx={cx} cy={y.head - headR * 1.05} r="18" fill={hairColor1} stroke="#1A1A1A" strokeWidth="1.8" />
            <circle cx={cx} cy={y.head - headR * 1.05} r="12" fill={hairColor1} opacity="0.6" />
          </g>
        )}

        {hairStyle === 'straight' && (
          <g>
            <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 1.02} ry={headR * 0.72} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
            <rect x={cx - headR * 0.82} y={y.head - headR * 0.05} width={headR * 0.15} height={y.shoulders - y.head + 5} rx="2" fill={hairColor1} stroke="#1A1A1A" strokeWidth="0.8" />
            <rect x={cx + headR * 0.67} y={y.head - headR * 0.05} width={headR * 0.15} height={y.shoulders - y.head + 5} rx="2" fill={hairColor1} stroke="#1A1A1A" strokeWidth="0.8" />
          </g>
        )}

        {!['long', 'short', 'medium', 'curly', 'wavy', 'ponytail', 'bun', 'buzz-cut', 'straight', 'bald'].includes(hairStyle) && (
          <ellipse cx={cx} cy={y.head - headR * 0.7} rx={headR * 0.98} ry={headR * 0.68} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
        )}
      </g>

      {/* === FACIAL FEATURES === */}
      <g filter="url(#softGlow)">
        {/* Eyebrows */}
        <path d={`M ${cx - headR * 0.42} ${y.head - headR * 0.28} Q ${cx - headR * 0.25} ${y.head - headR * 0.33} ${cx - headR * 0.12} ${y.head - headR * 0.28}`} 
          stroke="#3E2723" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d={`M ${cx + headR * 0.42} ${y.head - headR * 0.28} Q ${cx + headR * 0.25} ${y.head - headR * 0.33} ${cx + headR * 0.12} ${y.head - headR * 0.28}`} 
          stroke="#3E2723" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        {/* Left Eye */}
        <ellipse cx={cx - headR * 0.3} cy={y.head - headR * 0.15} rx="10" ry="12" fill="white" stroke="#1A1A1A" strokeWidth="1.2" />
        <circle cx={cx - headR * 0.3} cy={y.head - headR * 0.15} r="7" fill={eyeColor1} />
        <circle cx={cx - headR * 0.3} cy={y.head - headR * 0.15} r="4" fill="#000" />
        <circle cx={cx - headR * 0.27} cy={y.head - headR * 0.2} r="2" fill="white" opacity="0.95" />
        <ellipse cx={cx - headR * 0.3} cy={y.head - headR * 0.08} rx="9" ry="3" fill="none" stroke="#1A1A1A" strokeWidth="1" opacity="0.3" />

        {/* Right Eye */}
        <ellipse cx={cx + headR * 0.3} cy={y.head - headR * 0.15} rx="10" ry="12" fill="white" stroke="#1A1A1A" strokeWidth="1.2" />
        <circle cx={cx + headR * 0.3} cy={y.head - headR * 0.15} r="7" fill={eyeColor1} />
        <circle cx={cx + headR * 0.3} cy={y.head - headR * 0.15} r="4" fill="#000" />
        <circle cx={cx + headR * 0.33} cy={y.head - headR * 0.2} r="2" fill="white" opacity="0.95" />
        <ellipse cx={cx + headR * 0.3} cy={y.head - headR * 0.08} rx="9" ry="3" fill="none" stroke="#1A1A1A" strokeWidth="1" opacity="0.3" />

        {/* Eyelashes */}
        <path d={`M ${cx - headR * 0.38} ${y.head - headR * 0.2} L ${cx - headR * 0.4} ${y.head - headR * 0.23}`} stroke="#000" strokeWidth="1" strokeLinecap="round" />
        <path d={`M ${cx + headR * 0.38} ${y.head - headR * 0.2} L ${cx + headR * 0.4} ${y.head - headR * 0.23}`} stroke="#000" strokeWidth="1" strokeLinecap="round" />

        {/* Nose */}
        <path
          d={`M ${cx} ${y.head - headR * 0.18}
              L ${cx - 3} ${y.head + headR * 0.05}
              M ${cx} ${y.head - headR * 0.18}
              L ${cx + 3} ${y.head + headR * 0.05}`}
          stroke="#1A1A1A"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <ellipse cx={cx - 5} cy={y.head + headR * 0.06} rx="2.5" ry="3" fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.35" />
        <ellipse cx={cx + 5} cy={y.head + headR * 0.06} rx="2.5" ry="3" fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.35" />

        {/* Lips */}
        <path
          d={`M ${cx - headR * 0.25} ${y.head + headR * 0.4}
              Q ${cx} ${y.head + headR * 0.48} ${cx + headR * 0.25} ${y.head + headR * 0.4}`}
          stroke="#C85A54"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d={`M ${cx - headR * 0.25} ${y.head + headR * 0.4}
              Q ${cx} ${y.head + headR * 0.43} ${cx + headR * 0.25} ${y.head + headR * 0.4}`}
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cheek blush */}
        <ellipse cx={cx - headR * 0.5} cy={y.head + headR * 0.15} rx="12" ry="8" fill="#FF69B4" opacity="0.12" />
        <ellipse cx={cx + headR * 0.5} cy={y.head + headR * 0.15} rx="12" ry="8" fill="#FF69B4" opacity="0.12" />
      </g>

      {/* === BEARD === */}
      {beardStyle && beardStyle !== 'none' && (
        <g filter="url(#softGlow)">
          {beardStyle === 'full' && (
            <path
              d={`M ${cx - headR * 0.6} ${y.head + headR * 0.2}
                  Q ${cx - headR * 0.5} ${y.head + headR * 0.65}, ${cx} ${y.head + headR * 0.85}
                  Q ${cx + headR * 0.5} ${y.head + headR * 0.65}, ${cx + headR * 0.6} ${y.head + headR * 0.2}
                  L ${cx + headR * 0.45} ${y.head + headR * 0.15}
                  L ${cx - headR * 0.45} ${y.head + headR * 0.15}
                  Z`}
              fill="#3E2723"
              stroke="#1A1A1A"
              strokeWidth="1.2"
              opacity="0.9"
            />
          )}
          {beardStyle === 'goatee' && (
            <ellipse cx={cx} cy={y.head + headR * 0.6} rx={headR * 0.22} ry={headR * 0.18} fill="#3E2723" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.85" />
          )}
          {beardStyle === 'stubble' && (
            <path
              d={`M ${cx - headR * 0.55} ${y.head + headR * 0.25}
                  Q ${cx} ${y.head + headR * 0.65} ${cx + headR * 0.55} ${y.head + headR * 0.25}`}
              fill="#3E2723"
              opacity="0.25"
            />
          )}
          {beardStyle === 'mustache' && (
            <g>
              <path d={`M ${cx - headR * 0.28} ${y.head + headR * 0.32} Q ${cx - headR * 0.15} ${y.head + headR * 0.28} ${cx - headR * 0.02} ${y.head + headR * 0.32}`} 
                stroke="#3E2723" strokeWidth="5" strokeLinecap="round" />
              <path d={`M ${cx + headR * 0.28} ${y.head + headR * 0.32} Q ${cx + headR * 0.15} ${y.head + headR * 0.28} ${cx + headR * 0.02} ${y.head + headR * 0.32}`} 
                stroke="#3E2723" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}
        </g>
      )}

      {/* === PIERCINGS === */}
      {piercings && (
        <g filter="url(#softGlow)">
          <circle cx={cx - headR * 0.88} cy={y.head + 8} r="3.5" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
          <circle cx={cx + headR * 0.88} cy={y.head + 8} r="3.5" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
          {piercings.toLowerCase().includes('mũi') && (
            <circle cx={cx + 6} cy={y.head + headR * 0.06} r="2.5" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="0.8" />
          )}
        </g>
      )}

      {/* === ACCESSORIES === */}
      {accessories && accessories.length > 0 && (
        <g>
          {accessories.some(a => a.toLowerCase().includes('kính')) && (
            <g opacity="0.95" filter="url(#softGlow)">
              <rect x={cx - headR * 0.45} y={y.head - headR * 0.22} width={headR * 0.35} height={headR * 0.25} rx="4" fill="none" stroke="#2C3E50" strokeWidth="2.5" />
              <rect x={cx + headR * 0.1} y={y.head - headR * 0.22} width={headR * 0.35} height={headR * 0.25} rx="4" fill="none" stroke="#2C3E50" strokeWidth="2.5" />
              <path d={`M ${cx - headR * 0.1} ${y.head - headR * 0.095} L ${cx + headR * 0.1} ${y.head - headR * 0.095}`} stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
              <path d={`M ${cx - headR * 0.45} ${y.head - headR * 0.095} L ${cx - headR * 0.78} ${y.head - headR * 0.05}`} stroke="#2C3E50" strokeWidth="2" />
              <path d={`M ${cx + headR * 0.45} ${y.head - headR * 0.095} L ${cx + headR * 0.78} ${y.head - headR * 0.05}`} stroke="#2C3E50" strokeWidth="2" />
              {/* Lens reflection */}
              <ellipse cx={cx - headR * 0.27} cy={y.head - headR * 0.12} rx="8" ry="10" fill="white" opacity="0.2" />
              <ellipse cx={cx + headR * 0.27} cy={y.head - headR * 0.12} rx="8" ry="10" fill="white" opacity="0.2" />
            </g>
          )}
          
          {accessories.some(a => a.toLowerCase().includes('vòng cổ') || a.toLowerCase().includes('dây chuyền')) && (
            <g filter="url(#softGlow)">
              <ellipse cx={cx} cy={y.neck + 12} rx={headR * 0.48} ry="6" fill="none" stroke="#FFD700" strokeWidth="3.5" />
              <circle cx={cx} cy={y.neck + 18} r="5" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
              <circle cx={cx} cy={y.neck + 18} r="3" fill="#FFF8DC" opacity="0.7" />
            </g>
          )}
          
          {accessories.some(a => a.toLowerCase().includes('đồng hồ')) && (
            <g filter="url(#softGlow)">
              <rect x={cx - shoulderW / 2 - 16} y={y.waist + 20} width="16" height="13" rx="3" fill="#2C3E50" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx={cx - shoulderW / 2 - 8} cy={y.waist + 26.5} r="5" fill="#E8E8E8" stroke="#000" strokeWidth="0.5" />
              <path d={`M ${cx - shoulderW / 2 - 8} ${y.waist + 26.5} L ${cx - shoulderW / 2 - 8} ${y.waist + 23}`} stroke="#000" strokeWidth="0.8" strokeLinecap="round" />
              <path d={`M ${cx - shoulderW / 2 - 8} ${y.waist + 26.5} L ${cx - shoulderW / 2 - 6} ${y.waist + 26.5}`} stroke="#000" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          )}

          {accessories.some(a => a.toLowerCase().includes('mũ') || a.toLowerCase().includes('nón')) && (
            <ellipse cx={cx} cy={y.head - headR * 1.05} rx={headR * 1.1} ry={headR * 0.28} fill="#DC2626" stroke="#1A1A1A" strokeWidth="1.8" filter="url(#softGlow)" />
          )}
        </g>
      )}

      {/* === TATTOOS === */}
      {tattoos && (
        <g opacity="0.75">
          {(tattoos.toLowerCase().includes('tay') || tattoos.toLowerCase().includes('cánh tay')) && (
            <g>
              <circle cx={cx + shoulderW / 2 + 10} cy={y.waist} r="8" fill="#8B4513" opacity="0.4" />
              <path
                d={`M ${cx + shoulderW / 2 + 8} ${y.waist + 15}
                    Q ${cx + shoulderW / 2 + 12} ${y.waist + 22} ${cx + shoulderW / 2 + 8} ${y.waist + 30}
                    M ${cx + shoulderW / 2 + 6} ${y.waist + 18}
                    Q ${cx + shoulderW / 2 + 13} ${y.waist + 24} ${cx + shoulderW / 2 + 10} ${y.waist + 28}`}
                stroke="#1A1A1A"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )}
          {tattoos.toLowerCase().includes('lưng') && (
            <text x={cx} y={y.waist - 25} fontSize="24" textAnchor="middle" opacity="0.6">🦋</text>
          )}
        </g>
      )}

      {/* === MUSCLE DEFINITION === */}
      {muscleLevel && muscleLevel >= 4 && (
        <g opacity="0.15">
          <ellipse cx={cx - chestW / 3.5} cy={y.chest} rx="22" ry="26" fill="#000" />
          <ellipse cx={cx + chestW / 3.5} cy={y.chest} rx="22" ry="26" fill="#000" />
          <rect x={cx - 12} y={y.chest + 28} width="10" height="14" rx="3" fill="#000" />
          <rect x={cx + 2} y={y.chest + 28} width="10" height="14" rx="3" fill="#000" />
          <rect x={cx - 12} y={y.waist - 35} width="10" height="14" rx="3" fill="#000" />
          <rect x={cx + 2} y={y.waist - 35} width="10" height="14" rx="3" fill="#000" />
        </g>
      )}

      {muscleLevel && muscleLevel >= 4 && (
        <g>
          <text x={cx - 45} y={y.shoulders + 35} fontSize="22" opacity="0.85">💪</text>
          <text x={cx + 25} y={y.shoulders + 35} fontSize="22" opacity="0.85">💪</text>
        </g>
      )}

      {/* === INFO PANELS === */}
      
      {/* Top Left - Metrics */}
      <g filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))">
        <rect x="12" y="12" width="110" height={shoulderWidth || waistSize ? "105" : "75"} rx="10" fill="white" opacity="0.98" stroke="#E2E8F0" strokeWidth="2" />
        <text x="22" y="32" fontSize="13" fill="#1E293B" fontWeight="700">📏 {height} cm</text>
        <text x="22" y="50" fontSize="13" fill="#1E293B" fontWeight="700">⚖️ {weight} kg</text>
        <text x="22" y="68" fontSize="13" fill="#1E293B" fontWeight="700">🧮 {bmi.toFixed(1)}</text>
        {shoulderWidth && <text x="22" y="86" fontSize="11" fill="#64748B" fontWeight="600">👐 {shoulderWidth}cm</text>}
        {waistSize && <text x="22" y="101" fontSize="11" fill="#64748B" fontWeight="600">⭕ {waistSize}cm</text>}
      </g>

      {/* Top Right - Personal */}
      <g filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))">
        <rect x={W - 122} y="12" width="110" height={ageAppearance || hipSize || bodyProportionPreset ? "120" : "75"} rx="10" fill="white" opacity="0.98" stroke="#E2E8F0" strokeWidth="2" />
        <text x={W - 108} y="32" fontSize="13" fill="#1E293B" fontWeight="700">
          {gender === 'male' ? '♂️ Nam' : gender === 'female' ? '♀️ Nữ' : '⚥ Phi nhị giới'}
        </text>
        {ageAppearance && <text x={W - 108} y="50" fontSize="12" fill="#64748B" fontWeight="600">🎂 {ageAppearance} tuổi</text>}
        {bodyShape && (
          <text x={W - 108} y={ageAppearance ? "68" : "50"} fontSize="11" fill="#64748B" fontWeight="600">
            {bodyShape === 'slim' ? '📐 Gầy' : bodyShape === 'athletic' ? '🏃 Thể thao' :
             bodyShape === 'balanced' ? '⚖️ Cân đối' : bodyShape === 'muscular' ? '💪 Vạm vỡ' : 
             bodyShape === 'curvy' ? '🌟 Đẫy đà' : bodyShape === 'plus-size' ? '⭕ Mập' : '👤'}
          </text>
        )}
        {hipSize && <text x={W - 108} y={ageAppearance ? "86" : "68"} fontSize="11" fill="#64748B" fontWeight="600">🍑 {hipSize}cm</text>}
        {bodyProportionPreset && (
          <text x={W - 108} y={ageAppearance ? "104" : "86"} fontSize="10" fill="#94A3B8" fontWeight="500">
            {bodyProportionPreset === 'supermodel' ? '⭐ Siêu mẫu' : bodyProportionPreset === 'athletic' ? '🏋️ Thể hình' :
             bodyProportionPreset === 'realistic' ? '👤 Thực tế' : bodyProportionPreset === 'petite' ? '🧸 Nhỏ' :
             bodyProportionPreset === 'tall' ? '🦒 Cao' : '📏 TB'}
          </text>
        )}
      </g>

      {/* Bottom Left - Style */}
      {(clothingStyle || footwearType) && (
        <g filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))">
          <rect x="12" y={H - (footwearType ? 60 : 38)} width="120" height={footwearType ? "48" : "26"} rx="10" fill="white" opacity="0.98" stroke="#E2E8F0" strokeWidth="2" />
          {clothingStyle && (
            <text x="22" y={H - (footwearType ? 38 : 18)} fontSize="11" fill="#64748B" fontWeight="600">
              👕 {clothingStyle === 'sport' ? 'Thể thao' : clothingStyle === 'elegant' ? 'Thanh lịch' :
                  clothingStyle === 'street' ? 'Đường phố' : clothingStyle === 'business' ? 'Công sở' :
                  clothingStyle === 'formal' ? 'Chính thức' : clothingStyle === 'gothic' ? 'Gothic' : 'Casual'}
            </text>
          )}
          {footwearType && (
            <text x="22" y={H - 18} fontSize="11" fill="#64748B" fontWeight="600">
              👞 {footwearType === 'sneaker' ? 'Thể thao' : footwearType === 'heels' ? 'Cao gót' :
                  footwearType === 'boots' ? 'Bốt' : footwearType === 'sandals' ? 'Dép' :
                  footwearType === 'formal' ? 'Tây' : 'Giày'}
            </text>
          )}
        </g>
      )}

      {/* Bottom Right - Accessories */}
      {accessories && accessories.length > 0 && (
        <g filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))">
          <rect x={W - 132} y={H - 38} width="120" height="26" rx="10" fill="white" opacity="0.98" stroke="#E2E8F0" strokeWidth="2" />
          <text x={W - 120} y={H - 18} fontSize="10" fill="#64748B" fontWeight="600">
            💎 {accessories.slice(0, 3).join(', ')}
          </text>
        </g>
      )}

      {/* Color Palette */}
      {colorPalette && colorPalette.length > 0 && (
        <g filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))">
          <rect x="12" y={H - (clothingStyle || footwearType ? 88 : 68)} width="75" height="22" rx="6" fill="white" opacity="0.95" stroke="#E2E8F0" strokeWidth="1.5" />
          {colorPalette.slice(0, 4).map((color, i) => (
            <circle key={i} cx={20 + i * 17} cy={H - (clothingStyle || footwearType ? 77 : 57)} r="7" fill={color} stroke="#1A1A1A" strokeWidth="1.2" />
          ))}
        </g>
      )}

      {/* Leg Length Measurement */}
      {legLength && (
        <g opacity="0.6">
          <line x1={cx + hipW / 2 + 25} y1={y.hips} x2={cx + hipW / 2 + 25} y2={y.feet} stroke="#8B5CF6" strokeWidth="2.5" strokeDasharray="6,4" strokeLinecap="round" />
          <circle cx={cx + hipW / 2 + 25} cy={y.hips} r="4" fill="#8B5CF6" />
          <circle cx={cx + hipW / 2 + 25} cy={y.feet} r="4" fill="#8B5CF6" />
          <text x={cx + hipW / 2 + 35} y={(y.hips + y.feet) / 2 + 5} fontSize="12" fill="#8B5CF6" fontWeight="700">{legLength}cm</text>
        </g>
      )}

      {/* Skin Tone Label */}
      <g filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))">
        <rect x={W - 28} y={H - 100} width="20" height="85" rx="6" fill="white" opacity="0.95" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x={W - 18} y={H - 50} fontSize="10" fill="#64748B" fontWeight="600" transform={`rotate(90, ${W - 18}, ${H - 50})`}>
          {skinTone === 'very-light' ? '◻️ Rất sáng' : skinTone === 'light' ? '⬜ Sáng' :
           skinTone === 'medium' ? '🟫 TB' : skinTone === 'tan' ? '🟤 Ngăm' :
           skinTone === 'brown' ? '🟫 Nâu' : skinTone === 'dark' ? '⬛ Tối' : '🟫'}
        </text>
      </g>

      {/* Watermark */}
      <text x={cx} y={H - 8} fontSize="10" fill="#CBD5E1" textAnchor="middle" fontWeight="500">
        AIStyleHub Virtual Model
      </text>
    </svg>
  );
}
