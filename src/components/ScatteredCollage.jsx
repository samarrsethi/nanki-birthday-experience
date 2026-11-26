import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COLLAGE_PHOTOS = [
  {
    src: '/photos/photo2.jpg',
    ratio: 'aspect-[3/4]',
    caption: 'where it started',
    from: { x: -160, y: -60, rotation: -16, scale: 0.88 },
    to: { x: 0, y: 0, rotation: -2.5, scale: 1 },
    span: 'col-span-6 md:col-span-4',
  },
  {
    src: '/photos/photo3.jpg',
    ratio: 'aspect-[3/4]',
    caption: 'candid laughter',
    from: { x: 40, y: -120, rotation: 12, scale: 0.86 },
    to: { x: 0, y: 18, rotation: 2, scale: 1 },
    span: 'col-span-6 md:col-span-4',
  },
  {
    src: '/photos/photo7.jpg',
    ratio: 'aspect-[4/3]',
    caption: 'the warmth',
    from: { x: 160, y: -40, rotation: 14, scale: 0.9 },
    to: { x: 0, y: -8, rotation: -1.5, scale: 1 },
    span: 'col-span-12 md:col-span-4 self-center',
  },
  {
    src: '/photos/photo6.jpg',
    ratio: 'aspect-[4/3]',
    caption: 'unplanned days',
    from: { x: -140, y: 90, rotation: -12, scale: 0.86 },
    to: { x: 0, y: -12, rotation: 1.5, scale: 1 },
    span: 'col-span-12 md:col-span-5 self-center',
  },
  {
    src: '/photos/photo5.jpg',
    ratio: 'aspect-[3/4]',
    caption: 'quiet afternoons',
    from: { x: 20, y: 130, rotation: 10, scale: 0.88 },
    to: { x: 0, y: 8, rotation: -2, scale: 1 },
    span: 'col-span-6 md:col-span-3',
  },
  {
    src: '/photos/photo9.jpg',
    ratio: 'aspect-[3/4]',
    caption: 'always in my mind',
    from: { x: 150, y: 100, rotation: 15, scale: 0.86 },
    to: { x: 0, y: -10, rotation: 2.5, scale: 1 },
    span: 'col-span-6 md:col-span-4',
  },
];

/**
 * ScatteredCollage
 * Photographs enter scattered outward at diverse angles & positions,
 * then scrub smoothly together into a cohesive Pearl & Lilac collage as you scroll.
 */
export default function ScatteredCollage({ reducedMotion = false }) {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  React.useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const cfg = COLLAGE_PHOTOS[idx];

        gsap.fromTo(
          el,
          {
            x: cfg.from.x,
            y: cfg.from.y,
            rotation: cfg.from.rotation,
            scale: cfg.from.scale,
            opacity: 0.15,
          },
          {
            x: cfg.to.x,
            y: cfg.to.y,
            rotation: cfg.to.rotation,
            scale: cfg.to.scale,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 78%',
              end: 'center 42%',
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="collage"
      className="py-24 md:py-36 px-5 sm:px-8 bg-[#FCFBF9] overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14 md:mb-20 space-y-2">
          <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
            02B / OUR LITTLE WORLD
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl text-[#514753]">
            Pieces that fit <span className="font-editorial-italic">together.</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-4 sm:gap-6 items-start">
          {COLLAGE_PHOTOS.map((item, idx) => (
            <figure
              key={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={`${item.span} bg-[#FFFFFF] p-2 sm:p-2.5 pb-4 sm:pb-5 border border-[#C5B6CC]/50 shadow-[0_14px_34px_-10px_rgba(81,71,83,0.14)]`}
            >
              <div className={`${item.ratio} w-full overflow-hidden bg-[#E6DCEB]`}>
                <img
                  src={item.src}
                  alt={item.caption}
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <figcaption className="font-editorial-italic text-base sm:text-lg text-[#7C7080] text-center mt-2">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
