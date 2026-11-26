import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Volume2, VolumeX } from 'lucide-react';

import { siteContent } from './data/content';
import { ambientAudio } from './utils/ambientAudio';
import PreloaderIntro from './components/PreloaderIntro';
import LoveLetterEnvelope from './components/LoveLetterEnvelope';
import HeartSnakeCursor from './components/HeartSnakeCursor';
import ScatteredCollage from './components/ScatteredCollage';
import ParticleContact from './components/ParticleContact';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [activeNav, setActiveNav] = useState('story');
  const [reducedMotion, setReducedMotion] = useState(false);

  const mainRef = useRef(null);
  const progressRef = useRef(null);
  const lenisRef = useRef(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Initialize Lenis smooth scroll synced with GSAP ScrollTrigger
  useEffect(() => {
    if (!introDone || reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setTimeout(() => ScrollTrigger.refresh(), 120);

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [introDone, reducedMotion]);

  // Coordinated GSAP ScrollTrigger Choreography
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) return;

      // 1. Top 1px progress bar
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: document.documentElement,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        );
      }

      // 2. Hero subtle entrance + parallax
      gsap.fromTo(
        '.hero-stagger',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' }
      );

      gsap.to('.hero-photo-parallax', {
        y: 36,
        ease: 'none',
        scrollTrigger: {
          trigger: '#top',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 3. Priority 3: Scroll-Illuminated Text (#BEB2C4 -> #514753) + coordinated photos
      gsap.fromTo(
        '.illum-word',
        { color: '#BEB2C4' },
        {
          color: '#514753',
          stagger: 0.025,
          ease: 'none',
          scrollTrigger: {
            trigger: '#story',
            start: 'top 68%',
            end: 'bottom 76%',
            scrub: 0.6,
          },
        }
      );

      gsap.utils.toArray('.illum-photo').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: i % 2 === 0 ? 35 : 55, opacity: 0.4, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              end: 'top 45%',
              scrub: 0.8,
            },
          }
        );
      });

      // 4. Priority 5: Numbered Photographic Chapters scrubbed transitions
      gsap.utils.toArray('.chapter-row').forEach((row) => {
        const img = row.querySelector('.chapter-img');
        const text = row.querySelector('.chapter-text');

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.08, y: 24 },
            {
              scale: 1,
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                start: 'top 88%',
                end: 'top 35%',
                scrub: 0.9,
              },
            }
          );
        }

        if (text) {
          gsap.fromTo(
            text,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 78%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });

      // 5. Timeline vertical hairline draw
      const line = document.querySelector('.timeline-line');
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#timeline',
              start: 'top 70%',
              end: 'bottom 75%',
              scrub: 0.8,
            },
          }
        );
      }

      // 6. Priority 6: Smooth background shift to muted grey-lilac (#E1DAE6) for Apology
      gsap.fromTo(
        '#apology',
        { backgroundColor: '#F4F0F5' },
        {
          backgroundColor: '#E1DAE6',
          ease: 'none',
          scrollTrigger: {
            trigger: '#apology',
            start: 'top 80%',
            end: 'top 25%',
            scrub: true,
          },
        }
      );

      // 7. Active nav link tracking
      ['story', 'chapters', 'love-letter', 'apology'].forEach((id) => {
        const sec = document.getElementById(id);
        if (!sec) return;
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => setActiveNav(id),
          onEnterBack: () => setActiveNav(id),
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, [introDone, reducedMotion]);

  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -72, duration: 1.25 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSound = () => {
    if (soundOn) {
      ambientAudio.stop();
      setSoundOn(false);
    } else {
      ambientAudio.start(siteContent.audioSrc);
      setSoundOn(true);
    }
  };

  const storyWords = siteContent.illuminatedStory.text.split(' ');

  return (
    <div ref={mainRef} className="relative bg-[#FCFBF9] text-[#514753] min-h-screen">
      {/* Heart Cursor & Snake Scroll Trail */}
      <HeartSnakeCursor />

      {/* Subtle Paper Grain */}
      <div className="paper-grain" aria-hidden="true" />

      {/* Priority 2: 15–20s Cinematic Introduction */}
      {!introDone && (
        <PreloaderIntro
          reducedMotion={reducedMotion}
          onSoundChoice={(enabled) => setSoundOn(enabled)}
          onComplete={() => setIntroDone(true)}
        />
      )}

      {/* Fixed Editorial Header (Zero mobile collision/wrapping) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FCFBF9]/85 backdrop-blur-md border-b border-[#E6DCEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('#top')}
            className="font-editorial-italic text-xl sm:text-2xl text-[#514753] shrink-0 whitespace-nowrap cursor-pointer"
          >
            {siteContent.nickname}
          </button>

          <nav className="flex items-center gap-3.5 sm:gap-7 font-mono-meta text-[10px] sm:text-[11px] tracking-[0.12em] uppercase">
            {[
              { id: 'story', label: 'Story' },
              { id: 'chapters', label: 'Memories' },
              { id: 'love-letter', label: 'Letter' },
              { id: 'apology', label: 'Apology' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(`#${item.id}`)}
                className={`whitespace-nowrap transition-colors cursor-pointer ${
                  activeNav === item.id
                    ? 'text-[#514753] font-medium underline underline-offset-4 decoration-[#C5B6CC]'
                    : 'text-[#7C7080] hover:text-[#514753]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? 'Mute ambient sound' : 'Play ambient sound'}
              className="p-1.5 text-[#7C7080] hover:text-[#514753] transition-colors cursor-pointer shrink-0"
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </nav>
        </div>

        {/* 1px Scroll Progress Indicator */}
        <div
          ref={progressRef}
          className="h-[1.5px] bg-[#C5B6CC] origin-left w-full"
          style={{ transform: 'scaleX(0)' }}
        />
      </header>

      {/* BIRTHDAY HERO (#top) */}
      <section
        id="top"
        className="relative min-h-[100svh] flex items-center pt-20 pb-12 px-5 sm:px-8 overflow-hidden bg-[#FCFBF9]"
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-14 items-center">
          {/* Left: Editorial Typography */}
          <div className="space-y-5 text-left">
            <p className="hero-stagger font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080]">
              {siteContent.hero.kicker}
            </p>

            <h1 className="hero-stagger font-editorial text-[clamp(2.6rem,5.4vw,4.9rem)] leading-[1.03] tracking-[-0.02em] text-[#514753]">
              {siteContent.hero.titleLine1}
              <br />
              <span className="font-editorial-italic">{siteContent.hero.titleLine2}</span>
            </h1>

            <p className="hero-stagger text-base sm:text-lg text-[#7C7080] max-w-md leading-relaxed">
              {siteContent.hero.subtitle}
            </p>

            <div className="hero-stagger pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('#story')}
                className="font-mono-meta text-[11px] tracking-[0.18em] uppercase text-[#514753] border-b border-[#C5B6CC] pb-1 hover:border-[#514753] transition-colors cursor-pointer"
              >
                Begin the story &darr;
              </button>
            </div>
          </div>

          {/* Right: Dominant Hero Photograph in true 9:16 ratio */}
          <div className="flex justify-center md:justify-end">
            <div className="hero-photo-parallax w-[230px] sm:w-[270px] md:w-[300px] aspect-[9/16] overflow-hidden bg-[#E6DCEB] border border-[#C5B6CC]/50 shadow-[0_24px_60px_-18px_rgba(81,71,83,0.18)]">
              <img
                src={siteContent.hero.heroPhoto}
                alt="Harseerat and Samar"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 01 / WHO YOU ARE — SCROLL-ILLUMINATED TEXT (Priority 3) */}
      <section id="story" className="py-24 md:py-36 px-5 sm:px-8 bg-[#F4F0F5]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-start">
          <div className="space-y-6">
            <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
              {siteContent.illuminatedStory.eyebrow}
            </span>

            <p className="font-editorial text-[clamp(1.65rem,3.1vw,2.65rem)] leading-[1.35] tracking-[-0.01em]">
              {storyWords.map((word, idx) => (
                <span key={idx} className="illum-word inline-block mr-[0.26em] text-[#BEB2C4]">
                  {word}
                </span>
              ))}
            </p>
          </div>

          {/* Coordinated Photographs */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
            {siteContent.illuminatedStory.photos.map((item, idx) => (
              <figure
                key={idx}
                className={`illum-photo ${idx === 1 ? 'mt-8 sm:mt-12' : ''}`}
              >
                <div className={`${item.ratio} w-full overflow-hidden bg-[#E6DCEB] border border-[#C5B6CC]/40`}>
                  <img
                    src={item.src}
                    alt={item.label}
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <figcaption className="font-mono-meta text-[10px] tracking-[0.16em] uppercase text-[#7C7080] mt-2.5">
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* QUIET EDITORIAL MARQUEE */}
      <div className="py-6 border-y border-[#E6DCEB] bg-[#FCFBF9] overflow-hidden" aria-hidden="true">
        <div className="animate-marquee-slow">
          {[...siteContent.marqueeWords, ...siteContent.marqueeWords].map((word, idx) => (
            <div key={idx} className="flex items-center gap-8 mx-4">
              <span className="font-editorial-italic text-2xl sm:text-3xl text-[#7C7080] tracking-wide">
                {word.toLowerCase()}
              </span>
              <span className="text-[#C5B6CC] text-xs">&bull;</span>
            </div>
          ))}
        </div>
      </div>

      {/* 02 / CHAPTERS IN TIME — EDITORIAL PHOTO SHOWCASES (Priority 5) */}
      <section id="chapters" className="py-24 md:py-36 px-5 sm:px-8 bg-[#FCFBF9]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16 md:mb-24 space-y-3">
            <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
              02 / MEMORIES
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#514753] leading-[1.08]">
              Five moments I still <span className="font-editorial-italic">hold dear.</span>
            </h2>
          </div>

          <div className="space-y-24 md:space-y-32">
            {siteContent.photoChapters.map((chapter, idx) => {
              const isReversed = idx % 2 === 1;
              return (
                <article
                  key={chapter.number}
                  className="chapter-row grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
                >
                  {/* Dominant Photograph in true aspect ratio */}
                  <div
                    className={`md:col-span-7 ${
                      isReversed ? 'md:order-2' : 'md:order-1'
                    }`}
                  >
                    <div
                      className={`${chapter.ratio} max-h-[68vh] w-full mx-auto overflow-hidden bg-[#E6DCEB] border border-[#C5B6CC]/45`}
                    >
                      <img
                        src={chapter.photo}
                        alt={chapter.title}
                        loading="lazy"
                        className="chapter-img w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  {/* Minimal Editorial Typography */}
                  <div
                    className={`chapter-text md:col-span-5 space-y-4 ${
                      isReversed ? 'md:order-1 md:pr-6' : 'md:order-2 md:pl-6'
                    }`}
                  >
                    <div className="flex items-center gap-3 font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080]">
                      <span className="text-[#514753] font-medium">
                        {chapter.number} / {chapter.total}
                      </span>
                      <span className="w-6 h-[1px] bg-[#C5B6CC]" />
                      <span>{chapter.subtitle}</span>
                    </div>

                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#514753] leading-tight">
                      {chapter.title}
                    </h3>

                    <p className="text-base sm:text-lg text-[#7C7080] leading-relaxed">
                      {chapter.description}
                    </p>

                    <p className="font-editorial-italic text-xl text-[#514753] pt-2 border-t border-[#E6DCEB]">
                      {chapter.note}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 02B / OUR LITTLE WORLD — SCATTERED-TO-JOINED PHOTO COLLAGE */}
      <ScatteredCollage reducedMotion={reducedMotion} />

      {/* 03 / A LOVE LETTER — ENVELOPE + PAPER EXTRACTION ABOVE ENVELOPE (Priority 4) */}
      <LoveLetterEnvelope reducedMotion={reducedMotion} />

      {/* 04 / OUR TIMELINE */}
      <section id="timeline" className="py-24 md:py-32 px-5 sm:px-8 bg-[#FCFBF9]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 space-y-2">
            <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
              {siteContent.milestones.eyebrow}
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#514753]">
              {siteContent.milestones.heading}
            </h2>
          </div>

          <div className="relative pl-7 sm:pl-10 space-y-12">
            <div className="timeline-line absolute left-0 top-1 bottom-1 w-[1px] bg-[#C5B6CC] origin-top" />

            {siteContent.milestones.entries.map((entry, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[31.5px] sm:-left-[43.5px] top-2 w-2 h-2 rounded-full bg-[#514753]" />
                <span className="font-mono-meta text-[10px] tracking-[0.2em] uppercase text-[#7C7080] block">
                  {entry.label} · {entry.subtitle}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#514753] mt-1">
                  {entry.title}
                </h3>
                <p className="text-sm sm:text-base text-[#7C7080] mt-2 max-w-xl leading-relaxed">
                  {entry.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 / A SINCERE APOLOGY — MUTED GREY-LILAC TRANSITION (Priority 6) */}
      <section id="apology" className="py-28 md:py-40 px-5 sm:px-8 bg-[#F4F0F5]">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3 mb-8 text-center">
            <span className="font-mono-meta text-[11px] tracking-[0.2em] uppercase text-[#7C7080] block">
              {siteContent.apologyLetter.eyebrow}
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#514753] leading-tight">
              {siteContent.apologyLetter.heading}
            </h2>
          </div>

          {/* Interactive Dot-Particle Centerpiece ("i am sorry, harseerat.") */}
          <div className="mb-12">
            <ParticleContact text="i am sorry, harseerat." />
          </div>

          <div className="max-w-2xl mx-auto bg-[#FCFBF9]/90 border border-[#C5B6CC]/70 p-7 sm:p-12 space-y-5 shadow-[0_20px_50px_-15px_rgba(81,71,83,0.1)]">
            <p className="font-editorial-italic text-2xl sm:text-3xl text-[#514753]">
              {siteContent.apologyLetter.salutation}
            </p>

            {siteContent.apologyLetter.paragraphs.map((para, idx) => (
              <p
                key={idx}
                className={
                  para === 'I cheated on you.'
                    ? 'font-editorial text-xl sm:text-2xl text-[#514753] font-medium pl-4 border-l-2 border-[#514753] py-1'
                    : 'text-sm sm:text-base md:text-[17px] leading-[1.8] text-[#514753]'
                }
              >
                {para}
              </p>
            ))}

            <div className="pt-6 border-t border-[#E6DCEB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-editorial-italic text-2xl text-[#514753]">
                {siteContent.apologyLetter.closing}
              </span>
              <span className="font-mono-meta text-xs tracking-[0.14em] text-[#7C7080]">
                {siteContent.apologyLetter.signoff}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 06 / WARM CELEBRATORY FINALE */}
      <section
        id="finale"
        className="py-28 md:py-36 px-5 sm:px-8 bg-[#FCFBF9] text-center"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-editorial-italic text-3xl sm:text-5xl text-[#514753] leading-tight">
            happy birthday once again, nanki.
          </h2>

          <p className="text-base sm:text-lg text-[#7C7080] leading-relaxed max-w-xl mx-auto">
            i hope this year brings you all the happiness, peace, laughter, and beautiful moments you deserve.
          </p>

          <figure className="pt-4 max-w-lg mx-auto">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#E6DCEB] border border-[#C5B6CC]/55 shadow-[0_20px_50px_-15px_rgba(81,71,83,0.16)]">
              <img
                src="/photos/photo10.jpg"
                alt="Happy birthday once again, Nanki"
                loading="lazy"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <figcaption className="font-editorial-italic text-xl sm:text-2xl text-[#514753] mt-6">
              made with love, for your special day.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CLEAN EDITORIAL FOOTER */}
      <footer className="py-10 px-5 sm:px-8 bg-[#FCFBF9] border-t border-[#E6DCEB]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-meta text-[11px] tracking-[0.16em] uppercase text-[#7C7080]">
          <span>
            For {siteContent.fullName} ({siteContent.nickname}) · {siteContent.birthdayDate}
          </span>
          <button
            type="button"
            onClick={() => scrollToSection('#top')}
            className="text-[#514753] hover:underline underline-offset-4 cursor-pointer"
          >
            Back to top &uarr;
          </button>
        </div>
      </footer>
    </div>
  );
}
