import React, { useEffect, useRef, useState } from 'react';

/**
 * ParticleContact
 * Interactive dot-particle typography matching the 05 / CONTACT centerpiece:
 * - Renders the text on canvas as luminous #f0b4df particles
 * - Hovering radially repels particles outward into a clean circular halo
 * - Clicking triggers a dramatic burst before particles reassemble
 */
export default function ParticleContact({ text = "i'm sorry, nanki.", onParticleClick }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [clickedOnce, setClickedOnce] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let particles = [];
    let width = 0;
    let height = 0;
    let rafId = null;

    const mouse = { x: -9999, y: -9999, radius: 90, inside: false };

    const buildParticles = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(300, Math.floor(rect.width));
      height = Math.max(120, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontSize = Math.max(26, Math.min(72, Math.floor(width / (text.length * 0.54))));
      ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
      ctx.fillStyle = '#c4b5fd';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2);

      const data = ctx.getImageData(0, 0, width, height).data;
      particles = [];
      const step = width < 600 ? 2 : 3;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 110) {
            particles.push({
              x: x + (Math.random() - 0.5) * 8,
              y: y + (Math.random() - 0.5) * 8,
              ox: x,
              oy: y,
              vx: 0,
              vy: 0,
              size: width < 600 ? 1.3 : 1.75,
              alpha: Math.min(1, alpha / 255),
            });
          }
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    buildParticles();

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildParticles, 150);
    };
    window.addEventListener('resize', onResize);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.inside = true;
    };

    const onLeave = () => {
      mouse.inside = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const radius = Math.max(width * 0.6, 260);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < radius) {
          const force = ((radius - dist) / radius) * 26;
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }

      setClickedOnce(true);
      if (typeof onParticleClick === 'function') onParticleClick();
    };

    canvas.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouse.inside) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius && dist > 0.001) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 10;
            p.vy += Math.sin(angle) * force * 10;
          }
        }

        p.vx += (p.ox - p.x) * 0.09;
        p.vy += (p.oy - p.y) * 0.09;
        p.vx *= 0.84;
        p.vy *= 0.84;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.ox % 2 === 0 ? '#c4b5fd' : '#86efac';
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [text, onParticleClick]);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        aria-label={text}
        className="relative w-full max-w-5xl h-28 md:h-36 flex items-center justify-center select-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
      <span className="font-mono-label text-[11px] tracking-[0.2em] uppercase text-zinc-500 mt-1">
        {clickedOnce ? 'scattered — click below to read my letter' : 'hover to scatter · click to burst'}
      </span>
    </div>
  );
}
