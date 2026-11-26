import React from 'react';
import { Camera } from 'lucide-react';

/**
 * PhotoPlaceholder (now renders real photo when `src` is provided)
 * Preserves architectural frame, smooth group-hover zoom, and grayscale-to-color support.
 */
export default function PhotoPlaceholder({
  src,
  alt = 'Memory photo',
  slot = 'PHOTO 01',
  caption = 'Waiting for your photo',
  className = '',
  cursorLabel,
  grayscaleScrub = false,
}) {
  if (src) {
    return (
      <div
        data-cursor={cursorLabel}
        className={`group relative w-full h-full bg-zinc-900 border border-white/10 overflow-hidden transition-colors duration-300 hover:border-[#f0b4df]/45 ${className}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
            grayscaleScrub ? 'scrub-color-img grayscale' : ''
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
      </div>
    );
  }

  return (
    <div
      data-cursor={cursorLabel}
      className={`group relative w-full h-full bg-zinc-900/90 border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 transition-colors duration-300 hover:border-[#f0b4df]/40 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center gap-3 transition-transform duration-500 group-hover:scale-105">
        <div className="w-11 h-11 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-[#f0b4df]/80">
          <Camera size={18} strokeWidth={1.5} />
        </div>
        <span className="font-mono-label text-xs tracking-[0.22em] uppercase text-[#f0b4df]">
          {slot}
        </span>
        <span className="font-mono-label text-[11px] text-zinc-500 max-w-[200px]">
          {caption}
        </span>
      </div>
    </div>
  );
}
