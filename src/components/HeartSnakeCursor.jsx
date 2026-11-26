import React, { useEffect, useRef, useState } from 'react';

/**
 * HeartSnakeCursor (Pearl & Lilac Edition)
 * - Replaces the default arrow cursor with a crisp SVG heart on desktop (pointer: fine)
 * - Renders a smooth, tapering snake-like dragging trail on scroll & movement
 * - Completely disabled on touchscreens (pointer: coarse) so mobile scrolling stays clean
 */
export default function HeartSnakeCursor() {
  const canvasRef = useRef(null);
  const heartRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    document.documentElement.classList.add('hide-default-cursor');
    document.body.classList.add('hide-default-cursor');

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      prevX: width / 2,
      prevY: height / 2,
      vx: 0,
      vy: 0,
      speed: 0,
    };

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollWavePhase = 0;

    const NUM_POINTS = 36;
    const points = Array.from({ length: NUM_POINTS }, () => ({
      x: mouse.x,
      y: mouse.y,
      lateralOffset: 0,
    }));

    let rafId = null;
    let insideWindow = false;

    const onMouseMove = (e) => {
      if (!insideWindow) {
        insideWindow = true;
        setVisible(true);
      }
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      const t = e.target;
      if (
        t &&
        typeof t.closest === 'function' &&
        t.closest('button, a, [role="button"], input, textarea')
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const onMouseEnter = () => {
      insideWindow = true;
      setVisible(true);
    };

    const onMouseLeave = () => {
      insideWindow = false;
      setVisible(false);
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      scrollVelocity += delta * 0.85;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('scroll', onScroll, { passive: true });

    let time = 0;
    const render = () => {
      time += 0.04;
      scrollVelocity *= 0.92;
      if (Math.abs(scrollVelocity) > 0.01) {
        scrollWavePhase += scrollVelocity * 0.08;
      }

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x += (mouse.targetX - mouse.x) * 0.45;
      mouse.y += (mouse.targetY - mouse.y) * 0.45;
      mouse.vx = mouse.x - mouse.prevX;
      mouse.vy = mouse.y - mouse.prevY;
      mouse.speed = Math.hypot(mouse.vx, mouse.vy);

      if (heartRef.current) {
        const tilt = Math.max(-22, Math.min(22, mouse.vx * 2));
        heartRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      }

      points[0].x = mouse.x;
      points[0].y = mouse.y;

      const baseWaveAmp = Math.min(24, 3 + Math.abs(scrollVelocity) * 1.15 + mouse.speed * 0.3);

      for (let i = 1; i < NUM_POINTS; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;

        curr.x += dx * 0.52;
        curr.y += dy * 0.52;

        const wave =
          Math.sin(time * 3 + i * 0.32 + scrollWavePhase) *
          baseWaveAmp *
          (i / NUM_POINTS) *
          Math.min(1, (Math.abs(scrollVelocity) + mouse.speed + 1.0) / 4);

        curr.lateralOffset += (wave - curr.lateralOffset) * 0.3;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < NUM_POINTS - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const angle1 = Math.atan2(
          points[Math.max(0, i - 1)].y - p1.y,
          points[Math.max(0, i - 1)].x - p1.x
        );
        const px1 = -Math.sin(angle1) * p1.lateralOffset;
        const py1 = Math.cos(angle1) * p1.lateralOffset;

        const angle2 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const px2 = -Math.sin(angle2) * p2.lateralOffset;
        const py2 = Math.cos(angle2) * p2.lateralOffset;

        const progress = i / NUM_POINTS;
        const alpha = Math.max(0, (1 - progress) * 0.65);
        const lineWidth = Math.max(0.6, (1 - progress * 0.85) * 3.0);

        ctx.beginPath();
        ctx.moveTo(p1.x + px1, p1.y + py1);
        ctx.lineTo(p2.x + px2, p2.y + py2);
        ctx.strokeStyle = `rgba(140, 123, 158, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove('hide-default-cursor');
      document.body.classList.remove('hide-default-cursor');
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-screen h-screen pointer-events-none z-[90]"
      />

      <div
        ref={heartRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 w-6 h-6 pointer-events-none z-[95] flex items-center justify-center transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`w-full h-full overflow-visible transition-transform duration-150 ${
            clicking ? 'scale-90' : hovered ? 'scale-125' : 'scale-100'
          }`}
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={hovered ? '#514753' : '#C5B6CC'}
            stroke="#514753"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
