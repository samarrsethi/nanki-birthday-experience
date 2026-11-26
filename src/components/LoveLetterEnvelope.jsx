import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../data/content';

gsap.registerPlugin(ScrollTrigger);

/**
 * LoveLetterEnvelope — Priority 4
 * Physically convincing envelope and full-page paper extraction:
 * - While sealed, the paper is cleanly tucked inside the envelope (never protruding out sides/bottom)
 * - Flap opens upward with generous clearance below the section heading
 * - Paper rises UP out of the pocket, switches z-index to 30 ABOVE the envelope, and expands cleanly
 * - Opening lines illuminate to full opacity before the pin releases into the natural continuation
 */
export default function LoveLetterEnvelope({ reducedMotion = false }) {
  const pinSectionRef = useRef(null);
  const envelopeRef = useRef(null);
  const flapRef = useRef(null);
  const pocketRef = useRef(null);
  const paperRef = useRef(null);
  const sealRef = useRef(null);
  const lineRefs = useRef([]);

  const { eyebrow, heading, salutation, openingLines, remainingParagraphs, signoff } =
    siteContent.loveLetter;

  React.useEffect(() => {
    if (reducedMotion || !pinSectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSectionRef.current,
          start: 'top top',
          end: '+=190%',
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
        },
      });

      // 0.0 -> 0.16: Envelope enters cleanly
      tl.fromTo(
        envelopeRef.current,
        { y: 36, opacity: 0.6, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.16, ease: 'power2.out' },
        0
      );

      // 0.12 -> 0.32: Seal fades & flap opens in 3D
      tl.to(sealRef.current, { opacity: 0, scale: 0.7, duration: 0.1 }, 0.12);
      tl.to(
        flapRef.current,
        {
          rotateX: -180,
          duration: 0.22,
          ease: 'power2.inOut',
          onUpdate: function () {
            if (flapRef.current) {
              flapRef.current.style.zIndex = this.progress() > 0.45 ? '1' : '15';
            }
          },
        },
        0.14
      );

      // 0.32 -> 0.56: Paper slides UP out of the envelope pocket (clipped cleanly inside until it emerges)
      tl.fromTo(
        paperRef.current,
        { y: 16, scale: 0.78, opacity: 0 },
        {
          y: -155,
          scale: 0.9,
          opacity: 1,
          duration: 0.24,
          ease: 'power2.out',
          onStart: () => {
            if (paperRef.current) paperRef.current.style.zIndex = '6';
          },
          onComplete: () => {
            if (paperRef.current) paperRef.current.style.zIndex = '30';
          },
          onReverseComplete: () => {
            if (paperRef.current) paperRef.current.style.zIndex = '6';
          },
        },
        0.32
      );

      // 0.56 -> 0.78: Paper rises ABOVE the envelope & settles centered while envelope recedes
      tl.to(
        paperRef.current,
        {
          y: 0,
          scale: 1,
          duration: 0.22,
          ease: 'power3.out',
          onStart: () => {
            if (paperRef.current) paperRef.current.style.zIndex = '30';
          },
        },
        0.56
      );

      tl.to(
        [envelopeRef.current, pocketRef.current],
        {
          y: 120,
          opacity: 0.14,
          scale: 0.88,
          duration: 0.22,
          ease: 'power2.inOut',
        },
        0.56
      );

      // 0.66 -> 0.88: Opening lines illuminate to full opacity BEFORE pin releases at 1.0
      const lines = lineRefs.current.filter(Boolean);
      if (lines.length > 0) {
        tl.fromTo(
          lines,
          { opacity: 0.25, y: 10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.2,
            ease: 'power2.out',
          },
          0.66
        );
      }

      // Hold clean full-opacity state from 0.88 -> 1.0
      tl.to({}, { duration: 0.12 }, 0.88);
    }, pinSectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="love-letter" className="relative bg-[#F4F0F5] text-[#514753]">
      {/* Pinned Envelope & Paper Extraction Stage */}
      <div
        ref={pinSectionRef}
        className="relative min-h-[100svh] w-full flex flex-col items-center justify-center px-5 py-20 overflow-hidden"
      >
        {/* Overhead Eyebrow with generous clearance for open flap */}
        <div className="text-center mb-16 sm:mb-20 md:mb-24 space-y-2 relative z-40">
          <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
            {eyebrow}
          </span>
          <h2 className="font-editorial text-3xl md:text-5xl text-[#514753]">
            {heading}
          </h2>
        </div>

        {/* 3D Perspective Stage */}
        <div className="relative w-full max-w-2xl h-[360px] sm:h-[400px] md:h-[420px] flex items-center justify-center envelope-perspective">
          {/* Envelope Assembly */}
          <div
            ref={envelopeRef}
            className="relative w-[300px] sm:w-[400px] md:w-[460px] h-[195px] sm:h-[245px] md:h-[275px] preserve-3d"
          >
            {/* Layer 1: Envelope Back */}
            <div
              className="absolute inset-0 bg-[#E6DCEB] border border-[#C5B6CC]/70 shadow-[0_20px_50px_rgba(81,71,83,0.12)]"
              style={{ zIndex: 1 }}
            />

            {/* Layer 2/3: Emerging Paper Sheet (fits cleanly inside envelope width until scaled, rises ABOVE to z-30) */}
            <div
              ref={paperRef}
              style={{ zIndex: reducedMotion ? 30 : 6 }}
              className="absolute left-1/2 -translate-x-1/2 -top-6 w-[280px] sm:w-[380px] md:w-[540px] bg-[#FCFBF9] border border-[#C5B6CC]/60 p-6 sm:p-9 md:p-11 shadow-[0_24px_60px_-12px_rgba(81,71,83,0.18)]"
            >
              <p
                ref={(el) => (lineRefs.current[0] = el)}
                className="font-editorial-italic text-2xl sm:text-3xl text-[#514753] mb-4"
              >
                {salutation}
              </p>

              <div className="space-y-3.5">
                {openingLines.map((line, idx) => (
                  <p
                    key={idx}
                    ref={(el) => (lineRefs.current[idx + 1] = el)}
                    className="text-sm sm:text-base md:text-[17px] leading-[1.75] text-[#514753]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Layer 3: Envelope Front Pocket */}
            <div
              ref={pocketRef}
              style={{ zIndex: 10 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-[#EFE9F3] border-t border-[#C5B6CC]/50"
                style={{
                  clipPath: 'polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)',
                }}
              />
              <div
                className="absolute inset-0 bg-[#E6DCEB]/80"
                style={{
                  clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)',
                }}
              />
            </div>

            {/* Layer 4: Envelope Top Flap */}
            <div
              ref={flapRef}
              style={{
                zIndex: 15,
                transformOrigin: 'top center',
              }}
              className="absolute top-0 left-0 right-0 h-[56%] preserve-3d pointer-events-none"
            >
              <div
                className="w-full h-full bg-[#ECE4F1] border-b border-[#C5B6CC]/60 shadow-sm"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                }}
              />
            </div>

            {/* Lilac Seal */}
            <div
              ref={sealRef}
              style={{ zIndex: 18 }}
              className="absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#C5B6CC] border border-[#FCFBF9] shadow-md flex items-center justify-center pointer-events-none"
            >
              <span className="font-editorial-italic text-sm text-[#FCFBF9]">n</span>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Scroll Continuation (clean spacing below pinned stage, zero overlap) */}
      <div className="relative z-20 max-w-[540px] mx-auto px-5 pb-28 pt-4">
        <div className="bg-[#FCFBF9] border border-[#C5B6CC]/60 p-6 sm:p-9 md:p-11 shadow-[0_24px_60px_-12px_rgba(81,71,83,0.12)] space-y-5">
          {remainingParagraphs.map((para, idx) => (
            <p
              key={idx}
              className="text-sm sm:text-base md:text-[17px] leading-[1.75] text-[#514753]"
            >
              {para}
            </p>
          ))}

          <div className="pt-6 border-t border-[#E6DCEB] flex items-center justify-between">
            <span className="font-editorial-italic text-2xl text-[#514753]">{signoff}</span>
            <span className="font-mono-meta text-[10px] tracking-[0.18em] uppercase text-[#7C7080]">
              {siteContent.birthdayDate}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
