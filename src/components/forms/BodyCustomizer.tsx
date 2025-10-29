'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './BodyCustomizer.module.css';

// Expanded parts using all available assets
const parts = {
  hair: [
    '/body-parts/hair/hair-1.svg',
    '/body-parts/hair/hair-2.svg',
    '/body-parts/hair/hair-3.svg',
  ],
  head: [ // face without hair
    '/body-parts/faces/face-1.svg',
    '/body-parts/faces/face-2.svg',
    '/body-parts/heads/head-1.svg',
    '/body-parts/heads/head-2.svg',
    '/body-parts/heads/head-3.svg',
  ],
  torso: [
    '/body-parts/bodies/body-1.svg',
    '/body-parts/bodies/body-2.svg',
    '/body-parts/torso/torso-1.svg',
    '/body-parts/torso/torso-2.svg',
  ],
  leftArm: [
    '/body-parts/arms/arms-1.svg',
    '/body-parts/leftArm/leftArm-1.svg',
    '/body-parts/leftArm/leftArm-2.svg',
  ],
  rightArm: [
    '/body-parts/arms/arms-2.svg',
    '/body-parts/rightArm/rightArm-1.svg',
    '/body-parts/rightArm/rightArm-2.svg',
  ],
  legs: [
    '/body-parts/legs/legs-1.svg',
    '/body-parts/legs/legs-2.svg',
  ],
  feet: [
    '/body-parts/feet/feet-1.svg',
    '/body-parts/feet/feet-2.svg',
  ],
  accessories: [
    '/body-parts/accessories/accessory-1.svg',
    '/body-parts/accessories/accessory-2.svg',
  ],
};

export default function BodyCustomizer() {
  // Manage state for each part
  const [selectedHair, setHair] = useState(parts.hair[0]);
  const [selectedHead, setHead] = useState(parts.head[0]);
  const [selectedTorso, setTorso] = useState(parts.torso[0]);
  const [selectedLeftArm, setLeftArm] = useState(parts.leftArm[0]);
  const [selectedRightArm, setRightArm] = useState(parts.rightArm[0]);
  const [selectedLegs, setLegs] = useState(parts.legs[0]);
  const [selectedFeet, setFeet] = useState(parts.feet[0]);
  const [selectedAccessories, setAccessories] = useState(parts.accessories[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultPositions = {
    hair: { x: 200, y: 30, width: 200, height: 200 },
    head: { x: 220, y: 100, width: 160, height: 180 },
    torso: { x: 180, y: 280, width: 240, height: 400 },
    leftArm: { x: 120, y: 300, width: 120, height: 200 },
    rightArm: { x: 300, y: 300, width: 120, height: 200 },
    legs: { x: 200, y: 680, width: 200, height: 300 },
    feet: { x: 200, y: 900, width: 200, height: 100 },
    accessories: { x: 250, y: 150, width: 150, height: 150 },
  } as const;

  async function handleGenerate() {
    try {
      setLoading(true);
      setGeneratedImage(null);
      const selected = [
        { category: 'legs', imagePath: selectedLegs },
        { category: 'feet', imagePath: selectedFeet },
        { category: 'rightArm', imagePath: selectedRightArm },
        { category: 'torso', imagePath: selectedTorso },
        { category: 'leftArm', imagePath: selectedLeftArm },
        { category: 'head', imagePath: selectedHead },
        { category: 'hair', imagePath: selectedHair },
        { category: 'accessories', imagePath: selectedAccessories },
      ] as const;

      const partsPayload = selected.map((s, idx) => ({
        id: `${s.category}-${idx}`,
        name: s.category,
        category: s.category,
        imagePath: s.imagePath,
        position: defaultPositions[s.category],
        blendMode: 'normal',
        opacity: 1,
      }));

      const res = await fetch('/api/body-parts/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parts: partsPayload,
          canvasSize: { width: 600, height: 1000 },
          compositionName: `Quick Preview ${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedImage(data.data.imageUrl);
      } else {
        alert(data.error || 'Lỗi khi ghép ảnh');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tạo ảnh');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.customizerContainer}>
      {/* Display Area */}
      <div className={styles.displayArea}>
        {/* Layer order controlled via CSS z-index */}
        <Image
          src={selectedLegs}
          alt="Selected Legs"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.legs}`}
          priority
        />
        <Image
          src={selectedFeet}
          alt="Selected Feet"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.feet}`}
          priority
        />
        {/* Right arm behind torso */}
        <Image
          src={selectedRightArm}
          alt="Selected Right Arm"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.rightArm}`}
          priority
        />
        <Image
          src={selectedTorso}
          alt="Selected Torso"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.torso}`}
          priority
        />
        {/* Left arm in front of torso */}
        <Image
          src={selectedLeftArm}
          alt="Selected Left Arm"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.leftArm}`}
          priority
        />
        <Image
          src={selectedHead}
          alt="Selected Head"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.head}`}
          priority
        />
        {/* Hair always on top */}
        <Image
          src={selectedHair}
          alt="Selected Hair"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.hair}`}
          priority
        />
        {/* Accessories on top of everything */}
        <Image
          src={selectedAccessories}
          alt="Selected Accessories"
          width={300}
          height={500}
          className={`${styles.bodyPart} ${styles.accessories}`}
          priority
        />
      </div>

      {/* Control Panel */}
      <div className={styles.controlPanel}>
        <h3>Hair Options</h3>
        <div className={styles.optionsGrid}>
          {parts.hair.map((src) => (
            <button key={src} onClick={() => setHair(src)}>
              <Image src={src} alt="Hair option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Head Options</h3>
        <div className={styles.optionsGrid}>
          {parts.head.map((src) => (
            <button key={src} onClick={() => setHead(src)}>
              <Image src={src} alt="Head option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Torso Options</h3>
        <div className={styles.optionsGrid}>
          {parts.torso.map((src) => (
            <button key={src} onClick={() => setTorso(src)}>
              <Image src={src} alt="Torso option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Left Arm Options</h3>
        <div className={styles.optionsGrid}>
          {parts.leftArm.map((src) => (
            <button key={src} onClick={() => setLeftArm(src)}>
              <Image src={src} alt="Left Arm option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Right Arm Options</h3>
        <div className={styles.optionsGrid}>
          {parts.rightArm.map((src) => (
            <button key={src} onClick={() => setRightArm(src)}>
              <Image src={src} alt="Right Arm option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Leg Options</h3>
        <div className={styles.optionsGrid}>
          {parts.legs.map((src) => (
            <button key={src} onClick={() => setLegs(src)}>
              <Image src={src} alt="Legs option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Feet Options</h3>
        <div className={styles.optionsGrid}>
          {parts.feet.map((src) => (
            <button key={src} onClick={() => setFeet(src)}>
              <Image src={src} alt="Feet option" width={50} height={50} />
            </button>
          ))}
        </div>

        <h3>Accessories Options</h3>
        <div className={styles.optionsGrid}>
          {parts.accessories.map((src) => (
            <button key={src} onClick={() => setAccessories(src)}>
              <Image src={src} alt="Accessories option" width={50} height={50} />
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Đang ghép ảnh...' : 'Tạo ảnh PNG'}
        </button>

        {generatedImage && (
          <div>
            <h3 className="mt-4 mb-2">Ảnh đã ghép</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={generatedImage} alt="generated" width={300} height={500} />
          </div>
        )}
      </div>
    </div>
  );
}