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
  // Calculate body proportions
  const bmi = weight / Math.pow(height / 100, 2);
  
  // Determine body width factor
  const getBodyWidthFactor = () => {
    let factor = 1;
    
    if (bodyShape === 'slim') factor = 0.75;
    else if (bodyShape === 'athletic') factor = 1.05;
    else if (bodyShape === 'muscular') factor = 1.25;
    else if (bodyShape === 'curvy') factor = 1.2;
    else if (bodyShape === 'plus-size') factor = 1.5;
    else if (bmi < 18.5) factor = 0.8;
    else if (bmi > 25) factor = 1.25;
    else if (bmi > 30) factor = 1.5;
    
    if (fatLevel) {
      factor += (fatLevel - 3) * 0.08;
    }
    
    return Math.max(0.6, Math.min(2, factor));
  };

  const bodyWidthFactor = getBodyWidthFactor();

  // Get skin color
  const getSkinColor = () => {
    const colors: Record<string, string> = {
      'very-light': '#FFDFC4',
      'light': '#F0D5BE',
      'medium': '#D1A684',
      'tan': '#C68642',
      'brown': '#8D5524',
      'dark': '#5D4037',
    };
    return colors[skinTone] || colors['medium'];
  };

  // Get hair color
  const getHairColor = () => {
    const colors: Record<string, string> = {
      'black': '#2C2C2C',
      'brown': '#6F4E37',
      'blonde': '#F4DCA8',
      'red': '#C1440E',
      'white': '#F5F5F5',
      'gray': '#9E9E9E',
      'purple': '#8B4789',
      'blue': '#4A7C9E',
      'green': '#5A7C4E',
      'pink': '#FFB6C1',
      'other': '#FF6B9D',
    };
    return colors[hairColor] || colors['black'];
  };

  // Get eye color
  const getEyeColor = () => {
    const colors: Record<string, string> = {
      'brown': '#6F4E37',
      'black': '#1A1A1A',
      'blue': '#5B9BD5',
      'green': '#70AD47',
      'gray': '#A0A0A0',
      'amber': '#D97706',
      'hazel': '#8B7355',
    };
    return colors[eyeColor] || colors['brown'];
  };

  // Get clothing color
  const getClothingColor = () => {
    if (colorPalette && colorPalette.length > 0) {
      return colorPalette[0];
    }
    
    const colors: Record<string, string> = {
      'sport': '#3B82F6',
      'elegant': '#1F2937',
      'street': '#EF4444',
      'gothic': '#000000',
      'casual': '#6B7280',
      'business': '#1E3A8A',
      'formal': '#0F172A',
      'bohemian': '#D97706',
      'vintage': '#92400E',
      'preppy': '#DC2626',
      'minimalist': '#374151',
    };
    return colors[clothingStyle] || colors['casual'];
  };

  // Get pants color (darker shade)
  const getPantsColor = () => {
    if (colorPalette && colorPalette.length > 1) {
      return colorPalette[1];
    }
    return '#2C3E50';
  };

  // Get footwear color
  const getFootwearColor = () => {
    const colors: Record<string, string> = {
      'sneaker': '#FFFFFF',
      'heels': '#000000',
      'sandals': '#8B6F47',
      'boots': '#2C3E50',
      'formal': '#000000',
      'loafers': '#8B6F47',
      'flats': '#C19A6B',
      'slippers': '#9E9E9E',
    };
    return colors[footwearType || ''] || '#2C3E50';
  };

  const skinColor = getSkinColor();
  const hairColorValue = getHairColor();
  const eyeColorValue = getEyeColor();
  const topColor = getClothingColor();
  const pantsColor = getPantsColor();
  const footwearColor = getFootwearColor();

  // Calculate muscle definition
  const muscleFactor = muscleLevel ? 0.85 + (muscleLevel * 0.08) : 1;
  
  // SVG dimensions
  const W = 300;
  const H = 600;
  const centerX = W / 2;
  
  // Proportions based on human anatomy (8 heads rule)
  const headSize = H / 8.5;
  
  // Calculate body parts Y positions
  const headY = headSize * 0.6;
  const neckY = headSize * 1.2;
  const shouldersY = headSize * 1.5;
  const chestY = headSize * 2.5;
  const waistY = headSize * 3.5;
  const hipsY = headSize * 4.5;
  const crotchY = headSize * 4.8;
  const kneeY = headSize * 6.2;
  const ankleY = headSize * 7.8;
  const feetY = headSize * 8.2;
  
  // Calculate widths (use custom or auto-calculate)
  const baseBodyWidth = headSize * 2.2 * bodyWidthFactor;
  
  const shouldersWidth = shoulderWidth 
    ? (shoulderWidth / height) * W * 3.5
    : baseBodyWidth * 1.8 * muscleFactor;
    
  const chestWidth = baseBodyWidth * 1.6 * muscleFactor;
  
  const waistWidth = waistSize
    ? (waistSize / height) * W * 2.8
    : baseBodyWidth * 1.1;
    
  const hipsWidth = hipSize
    ? (hipSize / height) * W * 3
    : gender === 'female' ? baseBodyWidth * 1.4 : baseBodyWidth * 1.2;
    
  const thighWidth = baseBodyWidth * 0.55;
  const calfWidth = baseBodyWidth * 0.45;
  const ankleWidth = baseBodyWidth * 0.3;

  // Skin darker shade for shading
  const darkerSkin = `${skinColor}DD`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={skinColor} stopOpacity="0.9" />
          <stop offset="50%" stopColor={skinColor} />
          <stop offset="100%" stopColor={darkerSkin} />
        </linearGradient>

        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={topColor} />
          <stop offset="100%" stopColor={topColor} stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={pantsColor} />
          <stop offset="100%" stopColor={pantsColor} stopOpacity="0.85" />
        </linearGradient>

        <radialGradient id="shadow">
          <stop offset="0%" stopColor="#000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAFBFC" />
          <stop offset="100%" stopColor="#E8EEF2" />
        </linearGradient>

        {/* Hair gradient */}
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hairColorValue} />
          <stop offset="100%" stopColor={hairColorValue} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="url(#bgGrad)" />

      {/* Floor shadow */}
      <ellipse cx={centerX} cy={feetY + 15} rx={baseBodyWidth * 2} ry="12" fill="url(#shadow)" />

      {/* === BODY PARTS (Back to Front Order) === */}

      {/* LEGS - Pants */}
      {/* Left Leg */}
      <path
        d={`
          M ${centerX - hipsWidth / 2 + 5} ${hipsY}
          Q ${centerX - thighWidth} ${crotchY + 10} ${centerX - thighWidth} ${kneeY}
          Q ${centerX - calfWidth} ${kneeY + 20} ${centerX - calfWidth} ${ankleY}
          L ${centerX - ankleWidth} ${ankleY}
          Q ${centerX - ankleWidth} ${kneeY + 30} ${centerX - thighWidth * 0.7} ${kneeY}
          Q ${centerX - thighWidth * 0.7} ${crotchY + 20} ${centerX - 5} ${hipsY}
          Z
        `}
        fill="url(#pantsGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Right Leg */}
      <path
        d={`
          M ${centerX + hipsWidth / 2 - 5} ${hipsY}
          Q ${centerX + thighWidth} ${crotchY + 10} ${centerX + thighWidth} ${kneeY}
          Q ${centerX + calfWidth} ${kneeY + 20} ${centerX + calfWidth} ${ankleY}
          L ${centerX + ankleWidth} ${ankleY}
          Q ${centerX + ankleWidth} ${kneeY + 30} ${centerX + thighWidth * 0.7} ${kneeY}
          Q ${centerX + thighWidth * 0.7} ${crotchY + 20} ${centerX + 5} ${hipsY}
          Z
        `}
        fill="url(#pantsGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Knee shading */}
      <ellipse cx={centerX - thighWidth * 0.85} cy={kneeY} rx="8" ry="4" fill="#000" opacity="0.1" />
      <ellipse cx={centerX + thighWidth * 0.85} cy={kneeY} rx="8" ry="4" fill="#000" opacity="0.1" />

      {/* SHOES */}
      {footwearType === 'heels' ? (
        <>
          {/* Left Heel */}
          <g>
            <ellipse cx={centerX - calfWidth + 5} cy={feetY - 2} rx="12" ry="5" fill={footwearColor} stroke="#000" strokeWidth="1" />
            <rect x={centerX - calfWidth + 3} y={feetY - 2} width="3" height="12" rx="1" fill={footwearColor} stroke="#000" strokeWidth="0.8" />
          </g>
          {/* Right Heel */}
          <g>
            <ellipse cx={centerX + calfWidth - 5} cy={feetY - 2} rx="12" ry="5" fill={footwearColor} stroke="#000" strokeWidth="1" />
            <rect x={centerX + calfWidth - 6} y={feetY - 2} width="3" height="12" rx="1" fill={footwearColor} stroke="#000" strokeWidth="0.8" />
          </g>
        </>
      ) : footwearType === 'boots' ? (
        <>
          {/* Left Boot */}
          <path
            d={`M ${centerX - calfWidth - 3} ${ankleY - 25} L ${centerX - calfWidth - 3} ${feetY} 
                Q ${centerX - calfWidth + 8} ${feetY + 5} ${centerX - calfWidth + 15} ${feetY}
                L ${centerX - calfWidth + 15} ${ankleY - 25} Z`}
            fill={footwearColor}
            stroke="#000"
            strokeWidth="1.2"
          />
          {/* Right Boot */}
          <path
            d={`M ${centerX + calfWidth + 3} ${ankleY - 25} L ${centerX + calfWidth + 3} ${feetY} 
                Q ${centerX + calfWidth - 8} ${feetY + 5} ${centerX + calfWidth - 15} ${feetY}
                L ${centerX + calfWidth - 15} ${ankleY - 25} Z`}
            fill={footwearColor}
            stroke="#000"
            strokeWidth="1.2"
          />
        </>
      ) : (
        <>
          {/* Left Shoe */}
          <ellipse cx={centerX - calfWidth} cy={feetY} rx="14" ry="6" fill={footwearColor} stroke="#000" strokeWidth="1.2" />
          <ellipse cx={centerX - calfWidth} cy={feetY - 1} rx="10" ry="3" fill={footwearColor} opacity="0.5" />
          
          {/* Right Shoe */}
          <ellipse cx={centerX + calfWidth} cy={feetY} rx="14" ry="6" fill={footwearColor} stroke="#000" strokeWidth="1.2" />
          <ellipse cx={centerX + calfWidth} cy={feetY - 1} rx="10" ry="3" fill={footwearColor} opacity="0.5" />
        </>
      )}

      {/* TORSO - Shirt/Top */}
      <path
        d={`
          M ${centerX - shouldersWidth / 2} ${shouldersY}
          Q ${centerX - chestWidth / 2} ${chestY - 15} ${centerX - chestWidth / 2} ${chestY}
          Q ${centerX - waistWidth / 2 - 5} ${waistY - 10} ${centerX - waistWidth / 2} ${waistY}
          Q ${centerX - hipsWidth / 2} ${hipsY - 15} ${centerX - hipsWidth / 2} ${hipsY}
          L ${centerX + hipsWidth / 2} ${hipsY}
          Q ${centerX + hipsWidth / 2} ${hipsY - 15} ${centerX + waistWidth / 2} ${waistY}
          Q ${centerX + waistWidth / 2 + 5} ${waistY - 10} ${centerX + chestWidth / 2} ${chestY}
          Q ${centerX + chestWidth / 2} ${chestY - 15} ${centerX + shouldersWidth / 2} ${shouldersY}
          L ${centerX + shouldersWidth / 2 - 8} ${shouldersY + 5}
          Q ${centerX + chestWidth / 2 - 5} ${chestY - 10} ${centerX + waistWidth / 2 - 5} ${waistY + 5}
          Q ${centerX + hipsWidth / 2 - 8} ${hipsY - 10} ${centerX + hipsWidth / 2 - 8} ${hipsY - 5}
          L ${centerX - hipsWidth / 2 + 8} ${hipsY - 5}
          Q ${centerX - hipsWidth / 2 + 8} ${hipsY - 10} ${centerX - waistWidth / 2 + 5} ${waistY + 5}
          Q ${centerX - chestWidth / 2 + 5} ${chestY - 10} ${centerX - shouldersWidth / 2 + 8} ${shouldersY + 5}
          Z
        `}
        fill="url(#topGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Chest/Waist definition lines */}
      <path
        d={`M ${centerX - chestWidth / 2 + 10} ${chestY} Q ${centerX} ${chestY + 2} ${centerX + chestWidth / 2 - 10} ${chestY}`}
        stroke="#000"
        strokeWidth="0.5"
        opacity="0.2"
        fill="none"
      />

      {/* ARMS */}
      {/* Left Arm */}
      <path
        d={`
          M ${centerX - shouldersWidth / 2 + 5} ${shouldersY + 8}
          Q ${centerX - shouldersWidth / 2 - 12} ${shouldersY + 40} ${centerX - shouldersWidth / 2 - 15} ${shouldersY + 90}
          L ${centerX - shouldersWidth / 2 - 10} ${shouldersY + 95}
          Q ${centerX - shouldersWidth / 2 - 8} ${shouldersY + 50} ${centerX - shouldersWidth / 2 + 3} ${shouldersY + 15}
          Z
        `}
        fill="url(#topGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Left Forearm (skin) */}
      <path
        d={`
          M ${centerX - shouldersWidth / 2 - 12} ${shouldersY + 95}
          Q ${centerX - shouldersWidth / 2 - 10} ${waistY} ${centerX - shouldersWidth / 2 - 8} ${waistY + 35}
          L ${centerX - shouldersWidth / 2 - 5} ${waistY + 35}
          Q ${centerX - shouldersWidth / 2 - 7} ${waistY} ${centerX - shouldersWidth / 2 - 10} ${shouldersY + 95}
          Z
        `}
        fill="url(#skinGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Left Hand */}
      <ellipse
        cx={centerX - shouldersWidth / 2 - 6.5}
        cy={waistY + 42}
        rx="7"
        ry="9"
        fill={skinColor}
        stroke="#1A1A1A"
        strokeWidth="1"
      />
      <path
        d={`M ${centerX - shouldersWidth / 2 - 10} ${waistY + 42} L ${centerX - shouldersWidth / 2 - 12} ${waistY + 48}`}
        stroke="#1A1A1A"
        strokeWidth="0.8"
      />
      <path
        d={`M ${centerX - shouldersWidth / 2 - 6} ${waistY + 42} L ${centerX - shouldersWidth / 2 - 6} ${waistY + 48}`}
        stroke="#1A1A1A"
        strokeWidth="0.8"
      />

      {/* Right Arm */}
      <path
        d={`
          M ${centerX + shouldersWidth / 2 - 5} ${shouldersY + 8}
          Q ${centerX + shouldersWidth / 2 + 12} ${shouldersY + 40} ${centerX + shouldersWidth / 2 + 15} ${shouldersY + 90}
          L ${centerX + shouldersWidth / 2 + 10} ${shouldersY + 95}
          Q ${centerX + shouldersWidth / 2 + 8} ${shouldersY + 50} ${centerX + shouldersWidth / 2 - 3} ${shouldersY + 15}
          Z
        `}
        fill="url(#topGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Right Forearm (skin) */}
      <path
        d={`
          M ${centerX + shouldersWidth / 2 + 12} ${shouldersY + 95}
          Q ${centerX + shouldersWidth / 2 + 10} ${waistY} ${centerX + shouldersWidth / 2 + 8} ${waistY + 35}
          L ${centerX + shouldersWidth / 2 + 5} ${waistY + 35}
          Q ${centerX + shouldersWidth / 2 + 7} ${waistY} ${centerX + shouldersWidth / 2 + 10} ${shouldersY + 95}
          Z
        `}
        fill="url(#skinGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Right Hand */}
      <ellipse
        cx={centerX + shouldersWidth / 2 + 6.5}
        cy={waistY + 42}
        rx="7"
        ry="9"
        fill={skinColor}
        stroke="#1A1A1A"
        strokeWidth="1"
      />
      <path
        d={`M ${centerX + shouldersWidth / 2 + 10} ${waistY + 42} L ${centerX + shouldersWidth / 2 + 12} ${waistY + 48}`}
        stroke="#1A1A1A"
        strokeWidth="0.8"
      />
      <path
        d={`M ${centerX + shouldersWidth / 2 + 6} ${waistY + 42} L ${centerX + shouldersWidth / 2 + 6} ${waistY + 48}`}
        stroke="#1A1A1A"
        strokeWidth="0.8"
      />

      {/* NECK */}
      <path
        d={`
          M ${centerX - headSize * 0.25} ${neckY}
          L ${centerX - headSize * 0.3} ${shouldersY}
          L ${centerX + headSize * 0.3} ${shouldersY}
          L ${centerX + headSize * 0.25} ${neckY}
          Z
        `}
        fill="url(#skinGrad)"
        stroke="#1A1A1A"
        strokeWidth="1.2"
      />

      {/* HEAD */}
      {faceShape === 'round' ? (
        <circle cx={centerX} cy={headY} r={headSize * 0.6} fill="url(#skinGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
      ) : faceShape === 'square' ? (
        <rect x={centerX - headSize * 0.55} y={headY - headSize * 0.6} width={headSize * 1.1} height={headSize * 1.2} rx="8" fill="url(#skinGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
      ) : faceShape === 'long' ? (
        <ellipse cx={centerX} cy={headY} rx={headSize * 0.5} ry={headSize * 0.68} fill="url(#skinGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
      ) : faceShape === 'heart' ? (
        <path
          d={`
            M ${centerX - headSize * 0.45} ${headY - headSize * 0.4}
            Q ${centerX - headSize * 0.6} ${headY - headSize * 0.1} ${centerX - headSize * 0.5} ${headY + headSize * 0.2}
            Q ${centerX - headSize * 0.3} ${headY + headSize * 0.5} ${centerX} ${headSize + headY * 0.6}
            Q ${centerX + headSize * 0.3} ${headY + headSize * 0.5} ${centerX + headSize * 0.5} ${headY + headSize * 0.2}
            Q ${centerX + headSize * 0.6} ${headY - headSize * 0.1} ${centerX + headSize * 0.45} ${headY - headSize * 0.4}
            Q ${centerX} ${headY - headSize * 0.65} ${centerX - headSize * 0.45} ${headY - headSize * 0.4}
            Z
          `}
          fill="url(#skinGrad)"
          stroke="#1A1A1A"
          strokeWidth="1.8"
        />
      ) : faceShape === 'triangle' ? (
        <path
          d={`
            M ${centerX} ${headY - headSize * 0.6}
            L ${centerX - headSize * 0.5} ${headY + headSize * 0.5}
            Q ${centerX} ${headY + headSize * 0.6} ${centerX + headSize * 0.5} ${headY + headSize * 0.5}
            Z
          `}
          fill="url(#skinGrad)"
          stroke="#1A1A1A"
          strokeWidth="1.8"
        />
      ) : (
        <ellipse cx={centerX} cy={headY} rx={headSize * 0.55} ry={headSize * 0.62} fill="url(#skinGrad)" stroke="#1A1A1A" strokeWidth="1.8" />
      )}

      {/* EARS */}
      <g>
        <path
          d={`M ${centerX - headSize * 0.6} ${headY - 5} 
              Q ${centerX - headSize * 0.65} ${headY} ${centerX - headSize * 0.6} ${headY + 15}
              Q ${centerX - headSize * 0.55} ${headY + 10} ${centerX - headSize * 0.58} ${headY}
              Z`}
          fill={skinColor}
          stroke="#1A1A1A"
          strokeWidth="1"
        />
        <ellipse cx={centerX - headSize * 0.61} cy={headY + 3} rx="2" ry="3" fill={skinColor} opacity="0.7" />
      </g>
      <g>
        <path
          d={`M ${centerX + headSize * 0.6} ${headY - 5} 
              Q ${centerX + headSize * 0.65} ${headY} ${centerX + headSize * 0.6} ${headY + 15}
              Q ${centerX + headSize * 0.55} ${headY + 10} ${centerX + headSize * 0.58} ${headY}
              Z`}
          fill={skinColor}
          stroke="#1A1A1A"
          strokeWidth="1"
        />
        <ellipse cx={centerX + headSize * 0.61} cy={headY + 3} rx="2" ry="3" fill={skinColor} opacity="0.7" />
      </g>

      {/* HAIR */}
      {hairStyle === 'long' && (
        <g>
          {/* Hair mass on head */}
          <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.65} ry={headSize * 0.5} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Long hair flowing down */}
          <path
            d={`M ${centerX - headSize * 0.6} ${headY}
                Q ${centerX - headSize * 0.65} ${shouldersY + 30} ${centerX - headSize * 0.6} ${chestY + 40}
                L ${centerX - headSize * 0.5} ${chestY + 40}
                Q ${centerX - headSize * 0.55} ${shouldersY + 30} ${centerX - headSize * 0.5} ${headY}`}
            fill="url(#hairGrad)"
            stroke="#1A1A1A"
            strokeWidth="1.2"
          />
          <path
            d={`M ${centerX + headSize * 0.6} ${headY}
                Q ${centerX + headSize * 0.65} ${shouldersY + 30} ${centerX + headSize * 0.6} ${chestY + 40}
                L ${centerX + headSize * 0.5} ${chestY + 40}
                Q ${centerX + headSize * 0.55} ${shouldersY + 30} ${centerX + headSize * 0.5} ${headY}`}
            fill="url(#hairGrad)"
            stroke="#1A1A1A"
            strokeWidth="1.2"
          />
        </g>
      )}

      {hairStyle === 'short' && (
        <path
          d={`M ${centerX - headSize * 0.55} ${headY - headSize * 0.3}
              Q ${centerX} ${headY - headSize * 0.7} ${centerX + headSize * 0.55} ${headY - headSize * 0.3}
              Q ${centerX + headSize * 0.6} ${headY - headSize * 0.2} ${centerX + headSize * 0.6} ${headY}
              Q ${centerX + headSize * 0.55} ${headY + headSize * 0.15} ${centerX + headSize * 0.5} ${headY + headSize * 0.2}
              L ${centerX - headSize * 0.5} ${headY + headSize * 0.2}
              Q ${centerX - headSize * 0.55} ${headY + headSize * 0.15} ${centerX - headSize * 0.6} ${headY}
              Q ${centerX - headSize * 0.6} ${headY - headSize * 0.2} ${centerX - headSize * 0.55} ${headY - headSize * 0.3}
              Z`}
          fill="url(#hairGrad)"
          stroke="#1A1A1A"
          strokeWidth="1.5"
        />
      )}

      {hairStyle === 'medium' && (
        <g>
          <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.65} ry={headSize * 0.5} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          <path
            d={`M ${centerX - headSize * 0.6} ${headY}
                L ${centerX - headSize * 0.58} ${shouldersY - 10}
                L ${centerX - headSize * 0.48} ${shouldersY - 10}
                L ${centerX - headSize * 0.5} ${headY}
                Z`}
            fill="url(#hairGrad)"
            stroke="#1A1A1A"
            strokeWidth="1"
          />
          <path
            d={`M ${centerX + headSize * 0.6} ${headY}
                L ${centerX + headSize * 0.58} ${shouldersY - 10}
                L ${centerX + headSize * 0.48} ${shouldersY - 10}
                L ${centerX + headSize * 0.5} ${headY}
                Z`}
            fill="url(#hairGrad)"
            stroke="#1A1A1A"
            strokeWidth="1"
          />
        </g>
      )}

      {(hairStyle === 'curly' || hairStyle === 'wavy') && (
        <g>
          <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.7} ry={headSize * 0.55} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Curly strands */}
          {[...Array(5)].map((_, i) => (
            <circle
              key={i}
              cx={centerX - headSize * 0.5 + (i * headSize * 0.25)}
              cy={headY - headSize * 0.45 + (i % 2) * 5}
              r="4"
              fill={hairColorValue}
              opacity="0.6"
            />
          ))}
        </g>
      )}

      {hairStyle === 'ponytail' && (
        <g>
          <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.6} ry={headSize * 0.45} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Ponytail */}
          <ellipse cx={centerX} cy={headY - headSize * 0.55} rx="8" ry="12" fill={hairColorValue} stroke="#1A1A1A" strokeWidth="1" />
          <path
            d={`M ${centerX - 5} ${headY - headSize * 0.45}
                Q ${centerX} ${headY - headSize * 0.9} ${centerX + 5} ${headY - headSize * 0.45}`}
            fill={hairColorValue}
            stroke="#1A1A1A"
            strokeWidth="1.2"
          />
        </g>
      )}

      {hairStyle === 'bun' && (
        <g>
          <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.6} ry={headSize * 0.45} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Bun on top */}
          <circle cx={centerX} cy={headY - headSize * 0.7} r="12" fill={hairColorValue} stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx={centerX} cy={headY - headSize * 0.7} r="8" fill={hairColorValue} opacity="0.7" />
        </g>
      )}

      {hairStyle === 'buzz-cut' && (
        <ellipse cx={centerX} cy={headY - headSize * 0.4} rx={headSize * 0.57} ry={headSize * 0.35} fill={hairColorValue} stroke="#1A1A1A" strokeWidth="1.2" opacity="0.8" />
      )}

      {hairStyle === 'straight' && (
        <g>
          <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.65} ry={headSize * 0.5} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
          <rect x={centerX - headSize * 0.6} y={headY} width={headSize * 0.12} height={shouldersY - headY - 5} fill={hairColorValue} stroke="#1A1A1A" strokeWidth="0.8" />
          <rect x={centerX + headSize * 0.48} y={headY} width={headSize * 0.12} height={shouldersY - headY - 5} fill={hairColorValue} stroke="#1A1A1A" strokeWidth="0.8" />
        </g>
      )}

      {hairStyle === 'bald' && (
        <circle cx={centerX} cy={headY - headSize * 0.3} r="3" fill={skinColor} opacity="0.3" />
      )}

      {/* Default hair if not specified */}
      {!['long', 'short', 'medium', 'curly', 'wavy', 'ponytail', 'bun', 'buzz-cut', 'straight', 'bald'].includes(hairStyle) && (
        <ellipse cx={centerX} cy={headY - headSize * 0.5} rx={headSize * 0.6} ry={headSize * 0.48} fill="url(#hairGrad)" stroke="#1A1A1A" strokeWidth="1.5" />
      )}

      {/* FACIAL FEATURES */}
      {/* Eyebrows */}
      <path
        d={`M ${centerX - headSize * 0.28} ${headY - headSize * 0.2} 
            Q ${centerX - headSize * 0.15} ${headY - headSize * 0.24} ${centerX - headSize * 0.08} ${headY - headSize * 0.2}`}
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${centerX + headSize * 0.28} ${headY - headSize * 0.2} 
            Q ${centerX + headSize * 0.15} ${headY - headSize * 0.24} ${centerX + headSize * 0.08} ${headY - headSize * 0.2}`}
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Eyes */}
      {/* Left Eye */}
      <ellipse cx={centerX - headSize * 0.2} cy={headY - headSize * 0.1} rx="7" ry="9" fill="white" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx={centerX - headSize * 0.2} cy={headY - headSize * 0.1} r="5" fill={eyeColorValue} />
      <circle cx={centerX - headSize * 0.2} cy={headY - headSize * 0.1} r="2.5" fill="#000" />
      <circle cx={centerX - headSize * 0.18} cy={headY - headSize * 0.13} r="1.5" fill="white" opacity="0.9" />
      <path
        d={`M ${centerX - headSize * 0.27} ${headY - headSize * 0.15} 
            Q ${centerX - headSize * 0.2} ${headY - headSize * 0.17} ${centerX - headSize * 0.13} ${headY - headSize * 0.15}`}
        stroke="#1A1A1A"
        strokeWidth="1"
        fill="none"
      />

      {/* Right Eye */}
      <ellipse cx={centerX + headSize * 0.2} cy={headY - headSize * 0.1} rx="7" ry="9" fill="white" stroke="#1A1A1A" strokeWidth="1" />
      <circle cx={centerX + headSize * 0.2} cy={headY - headSize * 0.1} r="5" fill={eyeColorValue} />
      <circle cx={centerX + headSize * 0.2} cy={headY - headSize * 0.1} r="2.5" fill="#000" />
      <circle cx={centerX + headSize * 0.22} cy={headY - headSize * 0.13} r="1.5" fill="white" opacity="0.9" />
      <path
        d={`M ${centerX + headSize * 0.27} ${headY - headSize * 0.15} 
            Q ${centerX + headSize * 0.2} ${headY - headSize * 0.17} ${centerX + headSize * 0.13} ${headY - headSize * 0.15}`}
        stroke="#1A1A1A"
        strokeWidth="1"
        fill="none"
      />

      {/* Nose */}
      <path
        d={`M ${centerX} ${headY - headSize * 0.12} 
            Q ${centerX - 2} ${headY + headSize * 0.02} ${centerX - 4} ${headY + headSize * 0.08}
            M ${centerX} ${headY - headSize * 0.12}
            Q ${centerX + 2} ${headY + headSize * 0.02} ${centerX + 4} ${headY + headSize * 0.08}`}
        stroke="#1A1A1A"
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />
      <ellipse cx={centerX - 4} cy={headY + headSize * 0.08} rx="2" ry="2.5" fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.4" />
      <ellipse cx={centerX + 4} cy={headY + headSize * 0.08} rx="2" ry="2.5" fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.4" />

      {/* Mouth */}
      <path
        d={`M ${centerX - headSize * 0.18} ${headY + headSize * 0.25} 
            Q ${centerX} ${headY + headSize * 0.32} ${centerX + headSize * 0.18} ${headY + headSize * 0.25}`}
        stroke="#C1440E"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${centerX - headSize * 0.18} ${headY + headSize * 0.25} 
            Q ${centerX} ${headY + headSize * 0.28} ${centerX + headSize * 0.18} ${headY + headSize * 0.25}`}
        stroke="white"
        strokeWidth="1"
        opacity="0.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* BEARD */}
      {beardStyle && beardStyle !== 'none' && (
        <>
          {beardStyle === 'full' && (
            <path
              d={`
                M ${centerX - headSize * 0.45} ${headY + headSize * 0.15}
                Q ${centerX - headSize * 0.4} ${headY + headSize * 0.5} ${centerX} ${headY + headSize * 0.62}
                Q ${centerX + headSize * 0.4} ${headY + headSize * 0.5} ${centerX + headSize * 0.45} ${headY + headSize * 0.15}
                L ${centerX + headSize * 0.35} ${headY + headSize * 0.1}
                L ${centerX - headSize * 0.35} ${headY + headSize * 0.1}
                Z
              `}
              fill="#3E2723"
              opacity="0.85"
              stroke="#1A1A1A"
              strokeWidth="1"
            />
          )}
          {beardStyle === 'goatee' && (
            <ellipse
              cx={centerX}
              cy={headY + headSize * 0.45}
              rx={headSize * 0.15}
              ry={headSize * 0.12}
              fill="#3E2723"
              opacity="0.8"
            />
          )}
          {beardStyle === 'stubble' && (
            <path
              d={`M ${centerX - headSize * 0.4} ${headY + headSize * 0.2}
                  Q ${centerX} ${headY + headSize * 0.5} ${centerX + headSize * 0.4} ${headY + headSize * 0.2}`}
              fill="#3E2723"
              opacity="0.3"
            />
          )}
          {beardStyle === 'mustache' && (
            <g>
              <path
                d={`M ${centerX - headSize * 0.2} ${headY + headSize * 0.2}
                    Q ${centerX - headSize * 0.1} ${headY + headSize * 0.17} ${centerX} ${headY + headSize * 0.2}`}
                stroke="#3E2723"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d={`M ${centerX + headSize * 0.2} ${headY + headSize * 0.2}
                    Q ${centerX + headSize * 0.1} ${headY + headSize * 0.17} ${centerX} ${headY + headSize * 0.2}`}
                stroke="#3E2723"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          )}
        </>
      )}

      {/* PIERCINGS */}
      {piercings && (
        <>
          {/* Ear piercings (both ears) */}
          <circle cx={centerX - headSize * 0.61} cy={headY + 5} r="2.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />
          <circle cx={centerX + headSize * 0.61} cy={headY + 5} r="2.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />
          
          {/* Nose piercing */}
          {piercings.toLowerCase().includes('mũi') && (
            <circle cx={centerX + 5} cy={headY + headSize * 0.08} r="2" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="0.6" />
          )}
        </>
      )}

      {/* ACCESSORIES */}
      {accessories && accessories.length > 0 && (
        <>
          {/* Glasses */}
          {accessories.some(a => a.toLowerCase().includes('kính')) && (
            <g opacity="0.9">
              <rect
                x={centerX - headSize * 0.32}
                y={headY - headSize * 0.15}
                width={headSize * 0.24}
                height={headSize * 0.18}
                rx="3"
                fill="none"
                stroke="#2C3E50"
                strokeWidth="2"
              />
              <rect
                x={centerX + headSize * 0.08}
                y={headY - headSize * 0.15}
                width={headSize * 0.24}
                height={headSize * 0.18}
                rx="3"
                fill="none"
                stroke="#2C3E50"
                strokeWidth="2"
              />
              <line 
                x1={centerX - headSize * 0.08} 
                y1={headY - headSize * 0.06} 
                x2={centerX + headSize * 0.08} 
                y2={headY - headSize * 0.06} 
                stroke="#2C3E50" 
                strokeWidth="2" 
              />
              <line 
                x1={centerX - headSize * 0.32} 
                y1={headY - headSize * 0.06} 
                x2={centerX - headSize * 0.55} 
                y2={headY - headSize * 0.02} 
                stroke="#2C3E50" 
                strokeWidth="1.5" 
              />
              <line 
                x1={centerX + headSize * 0.32} 
                y1={headY - headSize * 0.06} 
                x2={centerX + headSize * 0.55} 
                y2={headY - headSize * 0.02} 
                stroke="#2C3E50" 
                strokeWidth="1.5" 
              />
            </g>
          )}
          
          {/* Necklace */}
          {accessories.some(a => a.toLowerCase().includes('vòng cổ') || a.toLowerCase().includes('dây chuyền')) && (
            <g>
              <ellipse
                cx={centerX}
                cy={neckY + 5}
                rx={headSize * 0.35}
                ry="5"
                fill="none"
                stroke="#FFD700"
                strokeWidth="2.5"
              />
              <circle cx={centerX} cy={neckY + 8} r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />
            </g>
          )}
          
          {/* Watch */}
          {accessories.some(a => a.toLowerCase().includes('đồng hồ')) && (
            <g>
              <rect
                x={centerX - shouldersWidth / 2 - 12}
                y={shouldersY + 95}
                width="12"
                height="10"
                rx="2"
                fill="#2C3E50"
                stroke="#1A1A1A"
                strokeWidth="0.8"
              />
              <circle cx={centerX - shouldersWidth / 2 - 6} cy={shouldersY + 100} r="3" fill="#E0E0E0" stroke="#000" strokeWidth="0.3" />
            </g>
          )}

          {/* Hat/Cap */}
          {accessories.some(a => a.toLowerCase().includes('mũ') || a.toLowerCase().includes('nón')) && (
            <ellipse
              cx={centerX}
              cy={headY - headSize * 0.7}
              rx={headSize * 0.7}
              ry={headSize * 0.2}
              fill="#DC2626"
              stroke="#1A1A1A"
              strokeWidth="1.5"
            />
          )}
        </>
      )}

      {/* TATTOOS */}
      {tattoos && (
        <>
          {/* Arm tattoos */}
          {(tattoos.toLowerCase().includes('tay') || tattoos.toLowerCase().includes('cánh tay')) && (
            <g>
              {/* Right arm tattoo */}
              <path
                d={`M ${centerX + shouldersWidth / 2 + 8} ${shouldersY + 100}
                    Q ${centerX + shouldersWidth / 2 + 12} ${shouldersY + 115} ${centerX + shouldersWidth / 2 + 8} ${shouldersY + 130}
                    M ${centerX + shouldersWidth / 2 + 6} ${shouldersY + 105}
                    L ${centerX + shouldersWidth / 2 + 10} ${shouldersY + 125}`}
                stroke="#1A1A1A"
                strokeWidth="2.5"
                fill="none"
                opacity="0.7"
                strokeLinecap="round"
              />
              <circle cx={centerX + shouldersWidth / 2 + 8} cy={shouldersY + 110} r="3" fill="#C1440E" opacity="0.5" />
            </g>
          )}
          
          {/* Back tattoo indicator */}
          {tattoos.toLowerCase().includes('lưng') && (
            <text x={centerX} y={waistY - 15} fontSize="18" textAnchor="middle" opacity="0.6">🎨</text>
          )}
        </>
      )}

      {/* MUSCLE DEFINITION */}
      {muscleLevel && muscleLevel >= 4 && (
        <g opacity="0.25">
          {/* Pecs */}
          <ellipse cx={centerX - chestWidth / 4} cy={chestY} rx="15" ry="18" fill="#000" />
          <ellipse cx={centerX + chestWidth / 4} cy={chestY} rx="15" ry="18" fill="#000" />
          {/* Abs */}
          <rect x={centerX - 8} y={chestY + 20} width="6" height="10" rx="2" fill="#000" />
          <rect x={centerX + 2} y={chestY + 20} width="6" height="10" rx="2" fill="#000" />
          <rect x={centerX - 8} y={waistY - 25} width="6" height="10" rx="2" fill="#000" />
          <rect x={centerX + 2} y={waistY - 25} width="6" height="10" rx="2" fill="#000" />
        </g>
      )}

      {/* === INFO PANELS === */}
      
      {/* Top Left Panel - Body Metrics */}
      <g>
        <rect 
          x="8" 
          y="8" 
          width="90" 
          height={shoulderWidth || waistSize ? "90" : "65"} 
          rx="6" 
          fill="white" 
          opacity="0.95" 
          stroke="#CBD5E1" 
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
        />
        <text x="15" y="25" fontSize="11" fill="#1F2937" fontWeight="700">📏 {height} cm</text>
        <text x="15" y="41" fontSize="11" fill="#1F2937" fontWeight="700">⚖️ {weight} kg</text>
        <text x="15" y="57" fontSize="11" fill="#1F2937" fontWeight="700">
          🧮 BMI: {bmi.toFixed(1)}
        </text>
        {shoulderWidth && (
          <text x="15" y="73" fontSize="9" fill="#6B7280" fontWeight="600">👐 Vai: {shoulderWidth}cm</text>
        )}
        {waistSize && (
          <text x="15" y="87" fontSize="9" fill="#6B7280" fontWeight="600">⭕ Eo: {waistSize}cm</text>
        )}
      </g>

      {/* Top Right Panel - Personal Info */}
      <g>
        <rect 
          x={W - 98} 
          y="8" 
          width="90" 
          height={ageAppearance || hipSize || bodyProportionPreset ? "100" : "65"} 
          rx="6" 
          fill="white" 
          opacity="0.95" 
          stroke="#CBD5E1" 
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
        />
        <text x={W - 90} y="25" fontSize="11" fill="#1F2937" fontWeight="700">
          {gender === 'male' ? '♂️ Nam' : gender === 'female' ? '♀️ Nữ' : '⚥ Phi nhị giới'}
        </text>
        {ageAppearance && (
          <text x={W - 90} y="41" fontSize="10" fill="#6B7280" fontWeight="600">
            🎂 {ageAppearance} tuổi
          </text>
        )}
        {bodyShape && (
          <text x={W - 90} y={ageAppearance ? "57" : "41"} fontSize="9" fill="#6B7280" fontWeight="600">
            {bodyShape === 'slim' ? '📐 Gầy' : 
             bodyShape === 'athletic' ? '🏃 Thể thao' :
             bodyShape === 'balanced' ? '⚖️ Cân đối' :
             bodyShape === 'muscular' ? '💪 Vạm vỡ' : 
             bodyShape === 'curvy' ? '🌟 Đẫy đà' : 
             bodyShape === 'plus-size' ? '⭕ Mập mạp' : '👤 Cân đối'}
          </text>
        )}
        {hipSize && (
          <text x={W - 90} y={ageAppearance ? "73" : "57"} fontSize="9" fill="#6B7280" fontWeight="600">
            🍑 Mông: {hipSize}cm
          </text>
        )}
        {bodyProportionPreset && (
          <text x={W - 90} y={ageAppearance ? "89" : "73"} fontSize="8" fill="#9CA3AF" fontWeight="500">
            {bodyProportionPreset === 'supermodel' ? '⭐ Siêu mẫu' :
             bodyProportionPreset === 'athletic' ? '🏋️ Thể hình' :
             bodyProportionPreset === 'realistic' ? '👤 Thực tế' :
             bodyProportionPreset === 'petite' ? '🧸 Nhỏ nhắn' :
             bodyProportionPreset === 'tall' ? '🦒 Cao lớn' : '📏 Trung bình'}
          </text>
        )}
      </g>

      {/* Bottom Left Panel - Style */}
      {(clothingStyle || footwearType) && (
        <g>
          <rect 
            x="8" 
            y={H - (footwearType ? 50 : 32)} 
            width="100" 
            height={footwearType ? "42" : "24"} 
            rx="6" 
            fill="white" 
            opacity="0.95" 
            stroke="#CBD5E1" 
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          {clothingStyle && (
            <text x="15" y={H - (footwearType ? 32 : 15)} fontSize="9" fill="#6B7280" fontWeight="600">
              👕 {clothingStyle === 'sport' ? 'Thể thao' :
                  clothingStyle === 'elegant' ? 'Thanh lịch' :
                  clothingStyle === 'street' ? 'Đường phố' :
                  clothingStyle === 'business' ? 'Công sở' :
                  clothingStyle === 'formal' ? 'Chính thức' :
                  clothingStyle === 'gothic' ? 'Gothic' :
                  clothingStyle === 'bohemian' ? 'Bohemian' :
                  clothingStyle === 'vintage' ? 'Cổ điển' : 'Thoải mái'}
            </text>
          )}
          {footwearType && (
            <text x="15" y={H - 15} fontSize="9" fill="#6B7280" fontWeight="600">
              👞 {footwearType === 'sneaker' ? 'Thể thao' :
                  footwearType === 'heels' ? 'Cao gót' :
                  footwearType === 'boots' ? 'Bốt' :
                  footwearType === 'sandals' ? 'Dép' :
                  footwearType === 'formal' ? 'Tây' :
                  footwearType === 'loafers' ? 'Lười' :
                  footwearType === 'flats' ? 'Bệt' : 'Giày'}
            </text>
          )}
        </g>
      )}

      {/* Bottom Right Panel - Accessories */}
      {(accessories && accessories.length > 0) && (
        <g>
          <rect 
            x={W - 108} 
            y={H - 32} 
            width="100" 
            height="24" 
            rx="6" 
            fill="white" 
            opacity="0.95" 
            stroke="#CBD5E1" 
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text x={W - 100} y={H - 15} fontSize="8" fill="#6B7280" fontWeight="600">
            💎 {accessories.slice(0, 3).join(', ')}
          </text>
        </g>
      )}

      {/* Color Palette Preview */}
      {colorPalette && colorPalette.length > 0 && (
        <g>
          <rect x="8" y={H - (clothingStyle ? 70 : 50)} width="60" height="16" rx="4" fill="white" opacity="0.9" stroke="#CBD5E1" strokeWidth="1" />
          {colorPalette.slice(0, 4).map((color, i) => (
            <g key={i}>
              <circle
                cx={14 + i * 14}
                cy={H - (clothingStyle ? 62 : 42)}
                r="5"
                fill={color}
                stroke="#1A1A1A"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>
      )}

      {/* Measurement Lines */}
      {legLength && (
        <g opacity="0.5">
          <line 
            x1={centerX + hipsWidth / 2 + 15} 
            y1={hipsY} 
            x2={centerX + hipsWidth / 2 + 15} 
            y2={feetY} 
            stroke="#8B5CF6" 
            strokeWidth="2" 
            strokeDasharray="4,3" 
          />
          <line x1={centerX + hipsWidth / 2 + 12} y1={hipsY} x2={centerX + hipsWidth / 2 + 18} y2={hipsY} stroke="#8B5CF6" strokeWidth="2" />
          <line x1={centerX + hipsWidth / 2 + 12} y1={feetY} x2={centerX + hipsWidth / 2 + 18} y2={feetY} stroke="#8B5CF6" strokeWidth="2" />
          <text x={centerX + hipsWidth / 2 + 22} y={(hipsY + feetY) / 2} fontSize="9" fill="#8B5CF6" fontWeight="600">
            {legLength}cm
          </text>
        </g>
      )}

      {/* Muscle/Strength Indicators */}
      {muscleLevel && muscleLevel >= 4 && (
        <>
          <text x={centerX + 25} y={shouldersY + 20} fontSize="16" opacity="0.8">💪</text>
          <text x={centerX - 40} y={shouldersY + 20} fontSize="16" opacity="0.8">💪</text>
        </>
      )}

      {/* Skin Tone Indicator */}
      <g>
        <rect x={W - 25} y={H - 60} width="17" height="52" rx="3" fill="white" opacity="0.9" stroke="#CBD5E1" strokeWidth="1" />
        <text x={W - 17} y={H - 45} fontSize="8" fill="#6B7280" transform={`rotate(90, ${W - 17}, ${H - 45})`}>
          {skinTone === 'very-light' ? 'Rất sáng' :
           skinTone === 'light' ? 'Sáng' :
           skinTone === 'medium' ? 'Trung bình' :
           skinTone === 'tan' ? 'Ngăm' :
           skinTone === 'brown' ? 'Nâu' :
           skinTone === 'dark' ? 'Tối' : 'Trung bình'}
        </text>
      </g>
    </svg>
  );
}
