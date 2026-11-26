import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor
 * Mirrors the exact mix-blend-difference cursor from amritanshu-portfolio-beryl.vercel.app:
 * - Default: 14px luminous circle
 * - Links/Buttons: 64px circle with blend inversion
 * - Preview frames ([data-cursor="View ↗"]): 92px solid pill with centered uppercase label
 * - Magnetic pull on [data-magnetic="true"] elements
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState('default'); // 'default' | 'big' | 'badge'
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    document.documentElement.classList.add('custom-cursor-active');

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let rafId = null;

    const onMouseMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);

      const el = e.target;
      if (!el || typeof el.closest !== 'function') return;

      const badgeTarget = el.closest('[data-cursor]');
      const interactiveTarget = el.closest('a, button, [role="button"], [data-magnetic="true"]');

      if (badgeTarget) {
        setLabel(badgeTarget.getAttribute('data-cursor') || 'VIEW ↗');
        setMode('badge');
      } else if (interactiveTarget) {
        setLabel('');
        setMode('big');
      } else {
        setLabel('');
        setMode('default');
      }
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    // Magnetic pull effect for [data-magnetic="true"]
    const magneticCleanup = [];
    const bindMagnetic = () => {
      document.querySelectorAll('[data-magnetic="true"]').forEach((btn) => {
        const onMove = (e) => {
          const rect = btn.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          btn.style.transform = `translate3d(${dx * 0.28}px, ${dy * 0.28}px, 0)`;
        };
        const onLeave = () => {
          btn.style.transform = 'translate3d(0, 0, 0)';
        };
        btn.addEventListener('mousemove', onMove);
        btn.addEventListener('mouseleave', onLeave);
        magneticCleanup.push(() => {
          btn.removeEventListener('mousemove', onMove);
          btn.removeEventListener('mouseleave', onLeave);
        });
      });
    };

    bindMagnetic();
    const observer = new MutationObserver(() => {
      magneticCleanup.forEach((fn) => fn());
      magneticCleanup.length = 0;
      bindMagnetic();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const render = () => {
      pos.x += (target.x - pos.x) * 0.24;
      pos.y += (target.y - pos.y) * 0.24;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      observer.disconnect();
      magneticCleanup.forEach((fn) => fn());
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [visible]);

  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  const sizeClass =
    mode === 'badge'
      ? 'w-[92px] h-[92px] bg-[#c4b5fd] text-[#070709] mix-blend-normal'
      : mode === 'big'
      ? 'w-16 h-16 bg-[#86efac] mix-blend-difference'
      : 'w-3.5 h-3.5 bg-[#c4b5fd] mix-blend-difference';

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 z-[80] rounded-full pointer-events-none flex items-center justify-center transition-[width,height,opacity,background-color] duration-200 ease-out ${sizeClass} ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {mode === 'badge' && (
        <span className="font-mono-label text-[11px] font-bold tracking-wider uppercase text-black select-none">
          {label}
        </span>
      )}
    </div>
  );
}
