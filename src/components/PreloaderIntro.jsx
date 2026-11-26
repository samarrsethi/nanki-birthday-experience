import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { siteContent } from '../data/content';
import { ambientAudio } from '../utils/ambientAudio';

/**
 * PreloaderIntro — Priority 2: 15–20s Cinematic Introduction
 * - Pearl & Lilac editorial aesthetic (#FCFBF9 / #F4F0F5 / #E6DCEB / #514753)
 * - Enter with sound, Enter without sound, and Skip controls
 * - Rhythm of fast photo sequences + brief visual pauses across configurable photos
 * - True natural aspect ratios (9:16, 3:4, 4:3) with changing positions, scales, rotations
 * - Final photograph settles smoothly as the intro transitions to the Birthday Hero
 */
export default function PreloaderIntro({ onComplete, onSoundChoice, reducedMotion = false }) {
  const [stage, setStage] = useState('loading'); // 'loading' | 'gate' | 'montage' | 'done'
  const [percent, setPercent] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const overlayRef = useRef(null);
  const frameRef = useRef(null);
  const timerRef = useRef(null);

  const montage = siteContent.introMontage || [];

  // Stage 1: Quick 00 -> 100% preload
  useEffect(() => {
    if (stage !== 'loading') return;

    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 12) + 8;
      if (pct >= 100) {
        setPercent(100);
        clearInterval(interval);
        setTimeout(() => setStage('gate'), 220);
      } else {
        setPercent(pct);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [stage]);

  // Stage 3: Timed 15-20s rhythmic montage
  useEffect(() => {
    if (stage !== 'montage') return;

    if (reducedMotion) {
      finishIntro();
      return;
    }

    let current = 0;
    const advance = () => {
      const item = montage[current];
      const delay = item?.pauseMs || 1100;

      timerRef.current = setTimeout(() => {
        if (current + 1 < montage.length) {
          current += 1;
          setActiveIdx(current);
          advance();
        } else {
          finishIntro();
        }
      }, delay);
    };

    advance();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stage, reducedMotion]);

  // Animate each frame entrance with GSAP
  useEffect(() => {
    if (stage !== 'montage' || !frameRef.current || reducedMotion) return;

    const item = montage[activeIdx];
    const isFinal = item?.isHeroFinal;

    gsap.fromTo(
      frameRef.current,
      {
        opacity: 0,
        scale: isFinal ? 0.94 : 0.9 + (activeIdx % 3) * 0.03,
        rotation: item?.rot || 0,
        y: isFinal ? 12 : (activeIdx % 2 === 0 ? 18 : -14),
      },
      {
        opacity: 1,
        scale: 1,
        rotation: item?.rot || 0,
        y: 0,
        duration: isFinal ? 0.85 : 0.45,
        ease: 'power3.out',
      }
    );
  }, [activeIdx, stage, reducedMotion]);

  const finishIntro = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (overlayRef.current && !reducedMotion) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.75,
        ease: 'power2.inOut',
        onComplete: () => {
          setStage('done');
          onComplete?.();
        },
      });
    } else {
      setStage('done');
      onComplete?.();
    }
  };

  const handleEnter = (withSound) => {
    if (withSound) {
      ambientAudio.start(siteContent.audioSrc);
      onSoundChoice?.(true);
    } else {
      onSoundChoice?.(false);
    }

    if (reducedMotion) {
      finishIntro();
    } else {
      setActiveIdx(0);
      setStage('montage');
    }
  };

  if (stage === 'done') return null;

  const currentItem = montage[activeIdx];
  // Vary horizontal composition subtly between left, center, and right for editorial rhythm
  const positionAlign =
    currentItem?.isHeroFinal
      ? 'justify-center'
      : activeIdx % 3 === 1
      ? 'md:justify-start md:pl-16 justify-center'
      : activeIdx % 3 === 2
      ? 'md:justify-end md:pr-16 justify-center'
      : 'justify-center';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] bg-[#FCFBF9] text-[#514753] flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle Lilac Ambient Wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 45%, rgba(230, 220, 235, 0.55), rgba(244, 240, 245, 0.25) 60%, transparent 100%)',
        }}
      />

      {/* Top Editorial Bar */}
      <div className="relative z-20 px-6 md:px-12 pt-6 flex items-center justify-between font-mono-meta text-[11px] tracking-[0.18em] uppercase text-[#7C7080]">
        <span>{siteContent.fullName} · {siteContent.birthdayDate}</span>
        {stage === 'montage' && (
          <span className="text-[#514753]">
            {String(activeIdx + 1).padStart(2, '0')} / {String(montage.length).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Center Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 min-h-0">
        {stage === 'loading' && (
          <div className="text-center space-y-3">
            <p className="font-mono-meta text-[11px] tracking-[0.22em] uppercase text-[#7C7080]">
              Preparing Keepsake
            </p>
            <div className="font-editorial text-5xl md:text-6xl text-[#514753] tabular-nums">
              {String(percent).padStart(2, '0')}
              <span className="text-[#C5B6CC] text-2xl ml-1">%</span>
            </div>
          </div>
        )}

        {stage === 'gate' && (
          <div className="max-w-lg w-full text-center space-y-7">
            <div className="space-y-2">
              <p className="font-mono-meta text-[11px] tracking-[0.22em] uppercase text-[#7C7080]">
                {siteContent.birthdayDate} · For {siteContent.nickname}
              </p>
              <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#514753] leading-[1.08]">
                Happy Birthday, <span className="font-editorial-italic">Harseerat</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleEnter(true)}
                className="w-full sm:w-auto px-7 py-3 bg-[#514753] text-[#FCFBF9] text-xs font-mono-meta tracking-[0.16em] uppercase hover:bg-[#3f3741] transition-colors cursor-pointer"
              >
                Enter with sound
              </button>
              <button
                type="button"
                onClick={() => handleEnter(false)}
                className="w-full sm:w-auto px-7 py-3 border border-[#C5B6CC] bg-[#F4F0F5] text-[#514753] text-xs font-mono-meta tracking-[0.16em] uppercase hover:bg-[#E6DCEB] transition-colors cursor-pointer"
              >
                Enter without sound
              </button>
            </div>
          </div>
        )}

        {stage === 'montage' && currentItem && (
          <div className={`w-full max-w-5xl h-full flex items-center ${positionAlign}`}>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              {/* True-ratio photograph frame */}
              <div
                ref={frameRef}
                className={`relative ${currentItem.ratio} h-[48vh] md:h-[60vh] max-w-[82vw] overflow-hidden bg-[#E6DCEB] shadow-[0_24px_60px_-15px_rgba(81,71,83,0.22)] border border-[#C5B6CC]/40`}
              >
                <img
                  src={currentItem.photo}
                  alt={currentItem.caption}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Editorial Caption */}
              <div className="text-center md:text-left max-w-xs space-y-2">
                <span className="font-mono-meta text-[10px] tracking-[0.22em] uppercase text-[#7C7080] block">
                  {currentItem.isHeroFinal ? 'December 1' : `Memory ${String(activeIdx + 1).padStart(2, '0')}`}
                </span>
                <p className="font-editorial-italic text-3xl md:text-4xl text-[#514753] leading-tight">
                  {currentItem.caption}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar & Skip Control */}
      <div className="relative z-20 px-6 md:px-12 pb-6 flex items-center justify-between">
        <span className="font-mono-meta text-[10px] tracking-[0.2em] uppercase text-[#7C7080]">
          A little piece of us
        </span>

        {(stage === 'gate' || stage === 'montage') && (
          <button
            type="button"
            onClick={finishIntro}
            className="px-4 py-2 border border-[#C5B6CC] text-[#514753] font-mono-meta text-[11px] tracking-[0.16em] uppercase hover:bg-[#E6DCEB] transition-colors cursor-pointer"
          >
            Skip intro &rarr;
          </button>
        )}
      </div>

      {/* Subtle top-edge progress bar during montage */}
      {stage === 'montage' && (
        <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-[#E6DCEB] z-30">
          <div
            className="h-full bg-[#514753] transition-all duration-500 ease-out"
            style={{ width: `${((activeIdx + 1) / montage.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
