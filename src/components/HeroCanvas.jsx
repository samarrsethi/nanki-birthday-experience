import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeroCanvas
 * Full-bleed Three.js WebGL undulating particle terrain/wave
 * reactive to mouse movement, styled in soft rose-lilac (#f0b4df / #d8b4fe).
 */
export default function HeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 14, 46);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle Grid
    const cols = 88;
    const rows = 56;
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPrimary = new THREE.Color('#c4b5fd');
    const colorSecondary = new THREE.Color('#86efac');

    const spacingX = 1.35;
    const spacingZ = 1.35;

    let idx = 0;
    for (let ix = 0; ix < cols; ix++) {
      for (let iz = 0; iz < rows; iz++) {
        const x = (ix - cols / 2) * spacingX;
        const z = (iz - rows / 2) * spacingZ;
        positions[idx * 3] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;

        const mixRatio = iz / rows;
        const c = colorPrimary.clone().lerp(colorSecondary, mixRatio * 0.55);
        colors[idx * 3] = c.r;
        colors[idx * 3 + 1] = c.g;
        colors[idx * 3 + 2] = c.b;
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let rafId = null;

    const animate = () => {
      const t = clock.getElapsedTime();
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const posAttr = geometry.attributes.position;
      const arr = posAttr.array;

      let i = 0;
      for (let ix = 0; ix < cols; ix++) {
        for (let iz = 0; iz < rows; iz++) {
          const x = arr[i * 3];
          const z = arr[i * 3 + 2];

          const wave1 = Math.sin(x * 0.14 + t * 0.85) * 2.2;
          const wave2 = Math.cos(z * 0.16 + t * 0.65) * 1.9;
          const pointerDist = Math.hypot(x - mouse.x * 24, z - mouse.y * 16);
          const ripple = Math.max(0, 12 - pointerDist) * 0.42;

          arr[i * 3 + 1] = wave1 + wave2 + ripple - 3.5;
          i++;
        }
      }

      posAttr.needsUpdate = true;
      points.rotation.y = mouse.x * 0.14;
      points.rotation.x = mouse.y * 0.06;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto" aria-hidden="true" />;
}
