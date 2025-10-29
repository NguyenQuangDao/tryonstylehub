
export interface BodyPart {
  id: string;
  name: string;
  category:
    | 'hair'
    | 'head'
    | 'torso'
    | 'leftArm'
    | 'rightArm'
    | 'legs'
    | 'feet'
    | 'accessories';
  imagePath: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  opacity?: number;
}

export interface BodyComposition {
  id: string;
  name: string;
  parts: BodyPart[];
  baseImage?: string; // Background image
  canvasSize: {
    width: number;
    height: number;
  };
}

export class BodyPartsComposer {
  private static instance: BodyPartsComposer;
  private bodyParts: Map<string, BodyPart> = new Map();
  private compositions: Map<string, BodyComposition> = new Map();

  private constructor() {
    this.initializeDefaultParts();
  }

  public static getInstance(): BodyPartsComposer {
    if (!BodyPartsComposer.instance) {
      BodyPartsComposer.instance = new BodyPartsComposer();
    }
    return BodyPartsComposer.instance;
  }

  private initializeDefaultParts(): void {
    const defaultParts: BodyPart[] = [
      // Head (face without hair)
      { id: 'head-1', name: 'Head Style 1', category: 'head', imagePath: '/body-parts/faces/face-1.svg', position: { x: 220, y: 100, width: 160, height: 180 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'head-2', name: 'Head Style 2', category: 'head', imagePath: '/body-parts/faces/face-2.svg', position: { x: 220, y: 100, width: 160, height: 180 }, blendMode: 'normal', opacity: 1.0 },
      // Bodies from Universal-LPC (full body sprites)
      { id: 'body-lpc-male-1', name: 'LPC Male Body', category: 'head', imagePath: '/body-parts/bodies/body-lpc-male-1.png', position: { x: 150, y: 0, width: 300, height: 600 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'body-lpc-female-1', name: 'LPC Female Body', category: 'head', imagePath: '/body-parts/bodies/body-lpc-female-1.png', position: { x: 150, y: 0, width: 300, height: 600 }, blendMode: 'normal', opacity: 1.0 },
      // Hair from Universal-LPC (positioned on head area)
      { id: 'hair-1', name: 'Hair Style 1', category: 'hair', imagePath: '/body-parts/hair/hair-1.svg', position: { x: 200, y: 30, width: 200, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'hair-2', name: 'Hair Style 2', category: 'hair', imagePath: '/body-parts/hair/hair-2.svg', position: { x: 200, y: 30, width: 200, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'hair-lpc-long-1', name: 'LPC Long Hair', category: 'hair', imagePath: '/body-parts/hair/hair-lpc-long-1.png', position: { x: 150, y: 0, width: 300, height: 400 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'hair-lpc-pixie-1', name: 'LPC Pixie Hair', category: 'hair', imagePath: '/body-parts/hair/hair-lpc-pixie-1.png', position: { x: 150, y: 0, width: 300, height: 300 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'hair-lpc-bob-1', name: 'LPC Bob Hair', category: 'hair', imagePath: '/body-parts/hair/hair-lpc-bob-1.png', position: { x: 150, y: 0, width: 300, height: 350 }, blendMode: 'normal', opacity: 1.0 },
      // Torso from Universal-LPC (positioned on torso area)
      { id: 'torso-1', name: 'Torso Style 1', category: 'torso', imagePath: '/body-parts/bodies/body-1.svg', position: { x: 180, y: 280, width: 240, height: 400 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'torso-2', name: 'Torso Style 2', category: 'torso', imagePath: '/body-parts/bodies/body-2.svg', position: { x: 180, y: 280, width: 240, height: 400 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'torso-lpc-longsleeve-1', name: 'LPC Long Sleeve Shirt', category: 'torso', imagePath: '/body-parts/torso/torso-lpc-longsleeve-1.png', position: { x: 150, y: 150, width: 300, height: 400 }, blendMode: 'normal', opacity: 1.0 },
      // Arms split
      { id: 'leftArm-1', name: 'Left Arm Style 1', category: 'leftArm', imagePath: '/body-parts/arms/arms-1.svg', position: { x: 120, y: 300, width: 120, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'rightArm-1', name: 'Right Arm Style 1', category: 'rightArm', imagePath: '/body-parts/arms/arms-2.svg', position: { x: 300, y: 300, width: 120, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      // Legs from Universal-LPC (positioned on legs area)
      { id: 'legs-1', name: 'Legs Style 1', category: 'legs', imagePath: '/body-parts/legs/legs-1.svg', position: { x: 200, y: 680, width: 200, height: 300 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'legs-2', name: 'Legs Style 2', category: 'legs', imagePath: '/body-parts/legs/legs-2.svg', position: { x: 200, y: 680, width: 200, height: 300 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'legs-lpc-pants-1', name: 'LPC Pants', category: 'legs', imagePath: '/body-parts/legs/legs-lpc-pants-1.png', position: { x: 150, y: 350, width: 300, height: 350 }, blendMode: 'normal', opacity: 1.0 },
      // Feet from Universal-LPC (positioned on feet area)
      { id: 'feet-1', name: 'Feet Style 1', category: 'feet', imagePath: '/body-parts/legs/legs-1.svg', position: { x: 200, y: 900, width: 200, height: 100 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'feet-2', name: 'Feet Style 2', category: 'feet', imagePath: '/body-parts/legs/legs-2.svg', position: { x: 200, y: 900, width: 200, height: 100 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'feet-lpc-shoes-1', name: 'LPC Shoes', category: 'feet', imagePath: '/body-parts/feet/feet-lpc-shoes-1.png', position: { x: 150, y: 500, width: 300, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      // Accessories from Universal-LPC (positioned on face area)
      { id: 'glasses-lpc-1', name: 'LPC Glasses', category: 'accessories', imagePath: '/body-parts/accessories/glasses-lpc-1.png', position: { x: 150, y: 80, width: 300, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'sunglasses-lpc-1', name: 'LPC Sunglasses', category: 'accessories', imagePath: '/body-parts/accessories/sunglasses-lpc-1.png', position: { x: 150, y: 80, width: 300, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      // New Universal-LPC assets
      {
        id: 'hair-lpc-afro-1',
        name: 'Afro Hair LPC',
        category: 'hair',
        imagePath: '/body-parts/hair/hair-lpc-afro-1.png',
        position: { x: 200, y: 30, width: 200, height: 120 },
        blendMode: 'normal',
        opacity: 1
      },
      {
        id: 'hair-lpc-braid-1',
        name: 'Braid Hair LPC',
        category: 'hair',
        imagePath: '/body-parts/hair/hair-lpc-braid-1.png',
        position: { x: 200, y: 30, width: 200, height: 120 },
        blendMode: 'normal',
        opacity: 1
      },
      {
        id: 'glasses-lpc-nerd-1',
        name: 'Nerd Glasses LPC',
        category: 'accessories',
        imagePath: '/body-parts/accessories/glasses-lpc-nerd-1.png',
        position: { x: 220, y: 80, width: 160, height: 80 },
        blendMode: 'normal',
        opacity: 1
      },
      {
        id: 'legs-lpc-pants-magenta-1',
        name: 'Magenta Pants LPC',
        category: 'legs',
        imagePath: '/body-parts/legs/legs-lpc-pants-magenta-1.png',
        position: { x: 200, y: 200, width: 200, height: 150 },
        blendMode: 'normal',
        opacity: 1
      }
    ];

    defaultParts.forEach(part => this.bodyParts.set(part.id, part));
  }

  public getBodyPartsByCategory(category: string): BodyPart[] {
    return Array.from(this.bodyParts.values()).filter(part => part.category === category);
  }

  public getAllBodyParts(): BodyPart[] {
    return Array.from(this.bodyParts.values());
  }

  public getBodyPart(id: string): BodyPart | undefined {
    return this.bodyParts.get(id);
  }

  public addBodyPart(part: BodyPart): void {
    this.bodyParts.set(part.id, part);
  }

  public createComposition(name: string, parts: BodyPart[], baseImage?: string): BodyComposition {
    const composition: BodyComposition = {
      id: `comp-${Date.now()}`,
      name,
      parts: [...parts],
      baseImage,
      canvasSize: { width: 600, height: 1000 }
    };
    this.compositions.set(composition.id, composition);
    return composition;
  }

  public getComposition(id: string): BodyComposition | undefined {
    return this.compositions.get(id);
  }

  public getAllCompositions(): BodyComposition[] {
    return Array.from(this.compositions.values());
  }

  public deleteComposition(id: string): boolean {
    return this.compositions.delete(id);
  }

  public updateComposition(id: string, updates: Partial<BodyComposition>): boolean {
    const composition = this.compositions.get(id);
    if (!composition) return false;
    this.compositions.set(id, { ...composition, ...updates });
    return true;
  }

  public validateComposition(composition: BodyComposition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!composition.name?.trim()) errors.push('Composition name is required');
    if (!composition.parts?.length) errors.push('At least one body part is required');

    // Overlaps are allowed for layered rendering; keep validation minimal.
    return { valid: errors.length === 0, errors };
  }
}
