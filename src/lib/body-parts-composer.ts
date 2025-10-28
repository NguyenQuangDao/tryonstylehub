
export interface BodyPart {
  id: string;
  name: string;
  category: 'head' | 'hair' | 'face' | 'body' | 'arms' | 'legs' | 'accessories';
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
      // Heads
      { id: 'head-1', name: 'Head Style 1', category: 'head', imagePath: '/body-parts/heads/head-1.svg', position: { x: 200, y: 50, width: 200, height: 250 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'head-2', name: 'Head Style 2', category: 'head', imagePath: '/body-parts/heads/head-2.svg', position: { x: 200, y: 50, width: 200, height: 250 }, blendMode: 'normal', opacity: 1.0 },
      // Hair
      { id: 'hair-1', name: 'Hair Style 1', category: 'hair', imagePath: '/body-parts/hair/hair-1.svg', position: { x: 200, y: 30, width: 200, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'hair-2', name: 'Hair Style 2', category: 'hair', imagePath: '/body-parts/hair/hair-2.svg', position: { x: 200, y: 30, width: 200, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      // Faces
      { id: 'face-1', name: 'Face Style 1', category: 'face', imagePath: '/body-parts/faces/face-1.svg', position: { x: 220, y: 100, width: 160, height: 180 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'face-2', name: 'Face Style 2', category: 'face', imagePath: '/body-parts/faces/face-2.svg', position: { x: 220, y: 100, width: 160, height: 180 }, blendMode: 'normal', opacity: 1.0 },
      // Bodies
      { id: 'body-1', name: 'Body Style 1', category: 'body', imagePath: '/body-parts/bodies/body-1.svg', position: { x: 180, y: 280, width: 240, height: 400 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'body-2', name: 'Body Style 2', category: 'body', imagePath: '/body-parts/bodies/body-2.svg', position: { x: 180, y: 280, width: 240, height: 400 }, blendMode: 'normal', opacity: 1.0 },
      // Arms
      { id: 'arms-1', name: 'Arms Style 1', category: 'arms', imagePath: '/body-parts/arms/arms-1.svg', position: { x: 120, y: 300, width: 120, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'arms-2', name: 'Arms Style 2', category: 'arms', imagePath: '/body-parts/arms/arms-2.svg', position: { x: 120, y: 300, width: 120, height: 200 }, blendMode: 'normal', opacity: 1.0 },
      // Legs
      { id: 'legs-1', name: 'Legs Style 1', category: 'legs', imagePath: '/body-parts/legs/legs-1.svg', position: { x: 200, y: 680, width: 200, height: 300 }, blendMode: 'normal', opacity: 1.0 },
      { id: 'legs-2', name: 'Legs Style 2', category: 'legs', imagePath: '/body-parts/legs/legs-2.svg', position: { x: 200, y: 680, width: 200, height: 300 }, blendMode: 'normal', opacity: 1.0 }
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
    
    // Check for overlapping parts
    for (let i = 0; i < composition.parts.length; i++) {
      for (let j = i + 1; j < composition.parts.length; j++) {
        if (this.isOverlapping(composition.parts[i].position, composition.parts[j].position)) {
          errors.push(`Parts "${composition.parts[i].name}" and "${composition.parts[j].name}" are overlapping`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  private isOverlapping(pos1: BodyPart['position'], pos2: BodyPart['position']): boolean {
    return !(pos1.x + pos1.width < pos2.x || pos2.x + pos2.width < pos1.x || 
             pos1.y + pos1.height < pos2.y || pos2.y + pos2.height < pos1.y);
  }
}
