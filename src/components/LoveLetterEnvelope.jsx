import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../data/content';

gsap.registerPlugin(ScrollTrigger);

/**
 * LoveLetterEnvelope — Priority 4
 * Physically convincing envelope and full-page paper extraction:
 * - Paper rises ABOVE the envelope (explicit z-index transition from inside pocket to z-30 above flap/pocket)
 * - Opening lines reveal sequentially via scrubbed scroll progress during the pinned sequence
 * - Releases the pinned sequence cleanly so the remainder of the letter scrolls naturally
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
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // 0.0 -> 0.2: Envelope enters softly
      tl.fromTo(
        envelopeRef.current,
        { y: 40, opacity: 0.5, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' },
        0
      );

      // 0.15 -> 0.35: Wax seal fades & flap opens in 3D
      tl.to(sealRef.current, { opacity: 0, scale: 0.7, duration: 0.12 }, 0.12);
      tl.to(
        flapRef.current,
        {
          rotateX: -180,
          duration: 0.25,
          ease: 'power2.inOut',
          onUpdate: function () {
            if (flapRef.current) {
              flapRef.current.style.zIndex = this.progress() > 0.45 ? '1' : '15';
            }
          },
        },
        0.15
      );

      // 0.35 -> 0.58: Paper slides UP out of the envelope pocket, then rises ABOVE the pocket
      tl.fromTo(
        paperRef.current,
        { y: 120, scale: 0.88, opacity: 0.92 },
        {
          y: -140,
          scale: 0.95,
          opacity: 1,
          duration: 0.25,
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
        0.35
      );

      // 0.58 -> 0.82: Paper settles centered ABOVE envelope as envelope recedes downward
      tl.to(
        paperRef.current,
        {
          y: 0,
          scale: 1,
          duration: 0.25,
          ease: 'power3.out',
          onStart: () => {
            if (paperRef.current) paperRef.current.style.zIndex = '30';
          },
        },
        0.58
      );

      tl.to(
        [envelopeRef.current, pocketRef.current],
        {
          y: 110,
          opacity: 0.18,
          scale: 0.9,
          duration: 0.25,
          ease: 'power2.inOut',
        },
        0.58
      );

      // 0.72 -> 1.0: Opening lines reveal sequentially via scroll progress
      const lines = lineRefs.current.filter(Boolean);
      if (lines.length > 0) {
        tl.fromTo(
          lines,
          { opacity: 0.12, y: 12 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.25,
            ease: 'power2.out',
          },
          0.72
        );
      }
    }, pinSectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="love-letter" className="relative bg-[#F4F0F5] text-[#514753]">
      {/* Pinned Envelope & Paper Extraction Stage */}
      <div
        ref={pinSectionRef}
        className="relative min-h-[100svh] w-full flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
      >
        {/* Overhead Eyebrow */}
        <div className="text-center mb-8 md:mb-10 space-y-2 relative z-40">
          <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
            {eyebrow}
          </span>
          <h2 className="font-editorial text-3xl md:text-5xl text-[#514753]">
            {heading}
          </h2>
        </div>

        {/* 3D Perspective Stage */}
        <div className="relative w-full max-w-2xl h-[430px] md:h-[470px] flex items-center justify-center envelope-perspective">
          {/* Envelope Assembly */}
          <div
            ref={envelopeRef}
            className="relative w-[310px] sm:w-[400px] md:w-[460px] h-[200px] sm:h-[250px] md:h-[280px] preserve-3d"
          >
            {/* Layer 1: Envelope Back */}
            <div
              className="absolute inset-0 bg-[#E6DCEB] border border-[#C5B6CC]/70 shadow-[0_20px_50px_rgba(81,71,83,0.12)]"
              style={{ zIndex: 1 }}
            />

            {/* Layer 2/3: Emerging Paper Sheet (starts inside pocket z-6, rises ABOVE to z-30) */}
            <div
              ref={paperRef}
              style={{ zIndex: reducedMotion ? 30 : 6 }}
              className="absolute left-1/2 -translate-x-1/2 top-3 w-[290px] sm:w-[460px] md:w-[580px] bg-[#FCFBF9] border border-[#C5B6CC]/60 p-7 sm:p-10 md:p-12 shadow-[0_24px_60px_-12px_rgba(81,71,83,0.18)]"
            >
              <p
                ref={(el) => (lineRefs.current[0] = el)}
                className="font-editorial-italic text-2xl sm:text-3xl text-[#514753] mb-5"
              >
                {salutation}
              </p>

              <div className="space-y-4">
                {openingLines.map((line, idx) => (
                  <p
                    key={idx}
                    ref={(el) => (lineRefs.current[idx + 1] = el)}
                    className="text-sm sm:text-base md:text-lg leading-[1.75] text-[#514753]"
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
              {/* Left & Right diagonal folds */}
              <div
                className="absolute inset-0 bg-[#EFE9F3] border-t border-[#C5B6CC]/50"
                style={{
                  clipPath: 'polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)',
                }}
              />
              {/* Bottom fold shadow */}
              <div
                className="absolute inset-0 bg-[#E6DCEB]/80"
                style={{
                  clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)',
                }}
              />
            </div>

            {/* Layer 4: Envelope Top Flap (rotates open in 3D) */}
            <div
              ref={flapRef}
              style={{
                zIndex: 15,
                transformOrigin: 'top center',
              }}
              className="absolute top-0 left-0 right-0 h-[58%] preserve-3d pointer-events-none"
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

      {/* Natural Scroll Continuation for Remainder of the Letter */}
      <div className="relative z-20 max-w-[580px] mx-auto px-6 pb-28 -mt-12 md:-mt-16">
        <div className="bg-[#FCFBF9] border border-[#C5B6CC]/60 border-t-0 p-7 sm:p-10 md:p-12 shadow-[0_24px_60px_-12px_rgba(81,71,83,0.12)] space-y-5">
          {remainingParagraphs.map((para, idx) => (
            <p
              key={idx}
              className="text-sm sm:text-base md:text-lg leading-[1.75] text-[#514753]"
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
