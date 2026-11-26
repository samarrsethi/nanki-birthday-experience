import React, { useEffect, useState } from 'react';
import { siteContent } from '../data/content';

/**
 * PreloaderIntro (Cinematic Film Edition)
 * - Clean minimal 00% -> 100% preloader in #070709 with white, soft purple (#c4b5fd), and sage green (#86efac)
 * - Transitions directly into a letterboxed Cinematic Video Montage where each photo
 *   is displayed in its true natural aspect ratio (9:16, 3:4, or 4:3) with slow Ken Burns motion,
 *   film timecode, and zero cheesy/vibe-coded overlays.
 */
export default function PreloaderIntro({ onComplete }) {
  const [stage, setStage] = useState('counting'); // 'counting' | 'film' | 'done'
  const [percent, setPercent] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);

  const scenes = siteContent.introScenes || [];

  // Stage 1: Smooth 00 -> 100% preloader -> directly into cinematic video
  useEffect(() => {
    if (stage !== 'counting') return;

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 10) + 5;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        clearInterval(interval);
        setTimeout(() => {
          setSceneIdx(0);
          setStage('film');
        }, 280);
      } else {
        setPercent(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [stage]);

  // Stage 2: Cinematic Film Sequence (1.55s per cut)
  useEffect(() => {
    if (stage !== 'film') return;

    const timer = setInterval(() => {
      setSceneIdx((prev) => {
        if (prev + 1 >= scenes.length) {
          clearInterval(timer);
          setTimeout(() => {
            setStage('done');
            onComplete?.();
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1550);

    return () => clearInterval(timer);
  }, [stage, scenes.length, onComplete]);

  if (stage === 'done') return null;

  const activeScene = scenes[sceneIdx];

  return (
    <>
      {/* Stage 1: Minimal Editorial Preloader */}
      {stage === 'counting' && (
        <div className="fixed inset-0 z-[70] bg-[#070709] flex flex-col justify-between p-8 md:p-12">
          <div className="flex items-center justify-between font-mono-label text-[11px] tracking-[0.22em] uppercase text-zinc-500">
            <span className="text-white">NANKI</span>
            <span className="flex items-center gap-2 text-[#86efac]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-pulse" />
              DECEMBER 1
            </span>
          </div>

          <div className="flex items-end justify-between">
            <span className="font-mono-label text-[11px] tracking-[0.2em] uppercase text-[#c4b5fd]">
              LOADING FILM
            </span>
            <div className="font-mono-label text-5xl md:text-7xl font-light text-white tabular-nums tracking-tighter">
              {String(percent).padStart(2, '0')}
              <span className="text-[#c4b5fd] text-2xl md:text-3xl ml-1">%</span>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: True-Ratio Cinematic Film Montage */}
      {stage === 'film' && activeScene && (
        <div className="fixed inset-0 z-[60] bg-[#070709] flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Reflection */}
          <div key={`bg-${sceneIdx}`} className="absolute inset-0 pointer-events-none">
            <img
              src={activeScene.photo}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-15 scale-110"
            />
          </div>

          {/* Top Cinema Letterbox Bar */}
          <div className="relative z-20 h-14 px-6 md:px-12 flex items-center justify-between border-b border-white/10 bg-[#070709]/90 font-mono-label text-[11px] tracking-[0.22em] uppercase">
            <span className="text-white">{activeScene.counter}</span>
            <span className="text-zinc-400 hidden sm:inline">{activeScene.timecode}</span>
            <span className="text-[#86efac]">{activeScene.label}</span>
          </div>

          {/* Center True-Aspect-Ratio Cinema Frame */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-6 min-h-0">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 max-w-5xl w-full h-full">
              {/* Photo in its exact natural aspect ratio (never stretched or face-cropped) */}
              <div
                key={`frame-${sceneIdx}`}
                className={`relative ${activeScene.ratio} h-[56vh] md:h-[68vh] max-w-full rounded-xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl`}
              >
                <img
                  src={activeScene.photo}
                  alt={activeScene.title}
                  className="w-full h-full object-cover object-top animate-[kenBurnsSlow_1.8s_ease-out_forwards]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Clean Minimal Editorial Caption */}
              <div className="text-center md:text-left space-y-2 md:min-w-[220px]">
                <span className="font-mono-label text-[11px] tracking-[0.25em] uppercase text-[#86efac] block">
                  {activeScene.label}
                </span>
                <h2 className="font-serif-italic text-5xl md:text-7xl text-white leading-none">
                  {activeScene.title}
                </h2>
                <div className="w-10 h-[1px] bg-[#c4b5fd]/60 mx-auto md:mx-0 mt-3" />
              </div>
            </div>
          </div>

          {/* Bottom Cinema Letterbox Bar + Progress + Skip */}
          <div className="relative z-20 h-16 px-6 md:px-12 flex items-center justify-between border-t border-white/10 bg-[#070709]/90">
            <span className="font-mono-label text-[11px] tracking-[0.2em] uppercase text-[#c4b5fd]">
              FOR NANKI &bull; DEC 1
            </span>

            <button
              type="button"
              onClick={() => {
                setStage('done');
                onComplete?.();
              }}
              className="px-5 py-2 rounded-full border border-white/20 text-white font-mono-label text-[11px] tracking-[0.18em] uppercase hover:border-[#86efac] hover:text-[#86efac] transition-colors"
            >
              SKIP &rarr;
            </button>
          </div>

          {/* Film Timeline Progress */}
          <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-white/10 z-30">
            <div
              className="h-full bg-gradient-to-r from-[#c4b5fd] to-[#86efac] transition-all duration-500 ease-out"
              style={{ width: `${((sceneIdx + 1) / scenes.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
}
