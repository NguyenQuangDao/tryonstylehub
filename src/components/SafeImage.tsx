"use client"
import Image from "next/image"
import { useMemo, useState } from "react"

type Props = {
  src: string
  srcList?: string[]
  alt: string
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
}

export default function SafeImage({ src, srcList, alt, width, height, sizes, className, priority }: Props) {
  const images = useMemo(() => (Array.isArray(srcList) && srcList.length > 0 ? srcList : [src]), [srcList, src])
  const [index, setIndex] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(images[0])
  const [triedBase, setTriedBase] = useState(false)
  const [failed, setFailed] = useState(false)

  const isExternal = useMemo(() => /^https?:\/\//.test(currentSrc), [currentSrc])

  const multiple = images.length > 1

  const goPrev = () => {
    const next = (index - 1 + images.length) % images.length
    setIndex(next)
    setCurrentSrc(images[next])
    setTriedBase(false)
    setFailed(false)
  }
  const goNext = () => {
    const next = (index + 1) % images.length
    setIndex(next)
    setCurrentSrc(images[next])
    setTriedBase(false)
    setFailed(false)
  }

  const handleError = () => {
    if (!triedBase && currentSrc.includes("?")) {
      setTriedBase(true)
      setCurrentSrc(currentSrc.split("?")[0])
      return
    }
    setFailed(true)
  }

  if (failed) {
    // Return a placeholder div with proper styling
    return (
      <div 
        className={className} 
        style={{ 
          backgroundColor: "#f3f4f6", 
          width: width ? `${width}px` : undefined, 
          height: height ? `${height}px` : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px'
        }}
      >
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>Image not available</span>
      </div>
    )
  }

  if (isExternal) {
    return (
      <div className="relative">
        <Image
          src={currentSrc}
          alt={alt}
          className={className}
          width={width}
          height={height}
          unoptimized
          priority={priority}
          onError={handleError}
        />
        {multiple && (
          <>
            <button type="button" onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white px-2 py-1" style={{lineHeight:'1', marginBottom:'1px'}}>‹</button>
            <button type="button" onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white px-2 py-1" style={{lineHeight:'1', marginBottom:'1px'}}>›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={"h-1.5 w-1.5 rounded-full " + (i === index ? "bg-white" : "bg-white/50")}></span>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        priority={priority}
        onError={handleError}
      />
      {multiple && (
        <>
          <button type="button" onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white px-2 py-1">‹</button>
          <button type="button" onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white px-2 py-1">›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={"h-1.5 w-1.5 rounded-full " + (i === index ? "bg-white" : "bg-white/50")}></span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
