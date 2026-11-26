import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../data/content';

gsap.registerPlugin(ScrollTrigger);

/**
 * ContinuousChapters — Priority 5 + Continuous Scrubbed Motion
 * Instead of static photo rows separated by empty space:
 * - Pinned stage scrubbed across all 5 chapters
 * - Chapter 01 shrinks/slides aside as Chapter 02 emerges from behind it
 * - Headings move upward while new photographs enter
 * - Photographs overlap, separate, and transform seamlessly into the next scene
 */
export default function ContinuousChapters({ reducedMotion = false }) {
  const sectionRef = useRef(null);
  const photoRefs = useRef([]);
  const textRefs = useRef([]);

  const chapters = siteContent.photoChapters || [];

  React.useEffect(() => {
    if (reducedMotion || !sectionRef.current || chapters.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${chapters.length * 95}%`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
        },
      });

      // Set initial states: Chapter 0 visible & prominent; Chapters 1..N tucked behind/offset
      chapters.forEach((_, idx) => {
        const photoEl = photoRefs.current[idx];
        const textEl = textRefs.current[idx];
        if (!photoEl || !textEl) return;

        if (idx === 0) {
          gsap.set(photoEl, { opacity: 1, scale: 1.06, xPercent: 0, yPercent: 0, zIndex: 10 });
          gsap.set(textEl, { opacity: 1, y: 0 });
        } else {
          gsap.set(photoEl, {
            opacity: 0,
            scale: 0.84,
            xPercent: idx % 2 === 1 ? 16 : -16,
            yPercent: 10,
            zIndex: 10 + idx,
          });
          gsap.set(textEl, { opacity: 0, y: 36 });
        }
      });

      // Transition each chapter into the next continuously
      chapters.forEach((_, idx) => {
        if (idx === chapters.length - 1) return;

        const currPhoto = photoRefs.current[idx];
        const currText = textRefs.current[idx];
        const nextPhoto = photoRefs.current[idx + 1];
        const nextText = textRefs.current[idx + 1];

        const tStart = idx * 1.0;

        // Current photo shrinks/slides aside while current heading moves upward & exits
        tl.to(
          currPhoto,
          {
            scale: 0.82,
            xPercent: idx % 2 === 0 ? -24 : 24,
            yPercent: -8,
            opacity: 0,
            duration: 0.85,
            ease: 'power2.inOut',
          },
          tStart + 0.15
        )
          .to(
            currText,
            {
              y: -36,
              opacity: 0,
              duration: 0.55,
              ease: 'power2.in',
            },
            tStart + 0.15
          )
          // Next photograph emerges from behind / opposite side into center focus
          .to(
            nextPhoto,
            {
              scale: 1,
              xPercent: 0,
              yPercent: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power2.out',
            },
            tStart + 0.3
          )
          // Next heading rises smoothly into place
          .to(
            nextText,
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power3.out',
            },
            tStart + 0.45
          );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, chapters.length]);

  if (reducedMotion) {
    return (
      <section id="chapters" className="py-20 px-5 sm:px-8 bg-[#FCFBF9]">
        <div className="max-w-5xl mx-auto space-y-16">
          {chapters.map((ch) => (
            <article key={ch.number} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className={`${ch.ratio} overflow-hidden bg-[#E6DCEB] border border-[#C5B6CC]/45`}>
                <img src={ch.photo} alt={ch.title} className="w-full h-full object-cover object-top" />
              </div>
              <div className="space-y-3">
                <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080]">
                  {ch.number} / {ch.total} · {ch.subtitle}
                </span>
                <h3 className="font-editorial text-3xl text-[#514753]">{ch.title}</h3>
                <p className="text-[#7C7080]">{ch.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="chapters"
      className="relative min-h-[100svh] w-full flex flex-col justify-center px-5 sm:px-8 py-16 bg-[#FCFBF9] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Top Section Header */}
        <div className="mb-8 md:mb-10 flex items-end justify-between border-b border-[#E6DCEB] pb-4">
          <div>
            <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
              02 / MEMORIES
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#514753]">
              Five moments I still <span className="font-editorial-italic">hold dear.</span>
            </h2>
          </div>
          <span className="font-mono-meta text-[10px] tracking-[0.18em] uppercase text-[#7C7080] hidden sm:inline">
            Scroll to transition
          </span>
        </div>

        {/* Continuous Stage: Stacked Photographs + Stacked Editorial Copy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center min-h-[56vh] md:min-h-[62vh]">
          {/* Left: Overlapping Photo Stage */}
          <div className="md:col-span-7 relative h-[42vh] sm:h-[48vh] md:h-[58vh] flex items-center justify-center">
            {chapters.map((ch, idx) => (
              <div
                key={ch.number}
                ref={(el) => (photoRefs.current[idx] = el)}
                className={`absolute ${ch.ratio} max-h-full h-full max-w-full overflow-hidden bg-[#E6DCEB] border border-[#C5B6CC]/50 shadow-[0_22px_55px_-15px_rgba(81,71,83,0.18)]`}
              >
                <img
                  src={ch.photo}
                  alt={ch.title}
                  loading="eager"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))}
          </div>

          {/* Right: Morphing Chapter Copy */}
          <div className="md:col-span-5 relative min-h-[210px] sm:min-h-[240px] flex items-center">
            {chapters.map((ch, idx) => (
              <div
                key={ch.number}
                ref={(el) => (textRefs.current[idx] = el)}
                className="absolute inset-x-0 space-y-4"
              >
                <div className="flex items-center gap-3 font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080]">
                  <span className="text-[#514753] font-medium">
                    {ch.number} / {ch.total}
                  </span>
                  <span className="w-6 h-[1px] bg-[#C5B6CC]" />
                  <span>{ch.subtitle}</span>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl text-[#514753] leading-tight">
                  {ch.title}
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-[#7C7080] leading-relaxed">
                  {ch.description}
                </p>

                <p className="font-editorial-italic text-xl text-[#514753] pt-2 border-t border-[#E6DCEB]">
                  {ch.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
