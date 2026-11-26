import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { X } from 'lucide-react';

import { siteContent } from './data/content';
import CustomCursor from './components/CustomCursor';
import PreloaderIntro from './components/PreloaderIntro';
import HeroCanvas from './components/HeroCanvas';
import PhotoPlaceholder from './components/PhotoPlaceholder';
import ParticleContact from './components/ParticleContact';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [activeNav, setActiveNav] = useState('about');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [apologyOpen, setApologyOpen] = useState(false);

  const mainRef = useRef(null);
  const progressBarRef = useRef(null);
  const lenisRef = useRef(null);

  // Lenis smooth scroll wired to GSAP ScrollTrigger
  useEffect(() => {
    if (!introDone) return;

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const update = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [introDone]);

  // Master GSAP ScrollTrigger choreography
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      // 1. Navbar scroll progress bar
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
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

      // 2. Hero title character-by-character clipped reveal
      gsap.fromTo(
        '.hero-char',
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.045,
          ease: 'power4.out',
          delay: 0.15,
        }
      );

      gsap.fromTo(
        '.hero-fade',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.35 }
      );

      // 3. About word-by-word scrub reveal
      gsap.fromTo(
        '.scrub-word',
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.03,
          ease: 'none',
          scrollTrigger: {
            trigger: '#about',
            start: 'top 72%',
            end: 'bottom 68%',
            scrub: 0.8,
          },
        }
      );

      // About portrait parallax + grayscale-to-color scrub
      gsap.to('.about-portrait', {
        y: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.fromTo(
        '.scrub-color-img',
        { filter: 'grayscale(1)' },
        {
          filter: 'grayscale(0)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#about',
            start: 'top 65%',
            end: 'bottom 55%',
            scrub: true,
          },
        }
      );

      // 4. Section heading clipped slide-up reveals
      gsap.utils.toArray('[data-heading="true"]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // 5. Sticky Stacking Cards scale-down choreography
      const stackCards = gsap.utils.toArray('[data-stack="true"]');
      stackCards.forEach((card, i) => {
        if (i < stackCards.length - 1) {
          const targetScale = 0.86 + i * 0.03;
          gsap.to(card, {
            scale: targetScale,
            opacity: 0.65,
            ease: 'none',
            scrollTrigger: {
              trigger: stackCards[i + 1],
              start: 'top 80%',
              end: 'top 20%',
              scrub: true,
            },
          });
        }
      });

      // 6. Love Letter paragraph reveals
      gsap.utils.toArray('.love-para').forEach((p) => {
        gsap.fromTo(
          p,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: p,
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // 7. Generic reveal items (bento cards, timeline entries)
      gsap.utils.toArray('[data-reveal="true"]').forEach((el, idx) => {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            delay: (idx % 3) * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // 8. Journey vertical timeline line draw
      const journeyLine = document.querySelector('[data-line="true"]');
      if (journeyLine) {
        gsap.fromTo(
          journeyLine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#journey',
              start: 'top 65%',
              end: 'bottom 75%',
              scrub: 1,
            },
          }
        );
      }

      // 9. Stats count-up
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const targetVal = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const obj = { val: 0 };

        gsap.to(obj, {
          val: targetVal,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.val)}${suffix}`;
          },
        });
      });

      // 10. Active nav tracking
      ['about', 'work', 'love-letter', 'wins', 'contact'].forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => setActiveNav(id),
          onEnterBack: () => setActiveNav(id),
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, [introDone]);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const aboutWords = siteContent.about.scrubText.split(' ');
  const heroChars = siteContent.herNameUpper.split('');

  return (
    <div ref={mainRef} className="relative bg-[#070709] text-white min-h-screen">
      {/* Film Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Custom Blend Cursor */}
      <CustomCursor />

      {/* Minimal Preloader & True-Ratio Cinematic Film Intro */}
      {!introDone && <PreloaderIntro onComplete={() => setIntroDone(true)} />}

      {/* Fixed Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between font-mono-label text-xs tracking-[0.18em] uppercase">
          <button
            type="button"
            onClick={() => scrollTo('#top')}
            className="text-white hover:text-[#c4b5fd] transition-colors font-semibold"
          >
            {siteContent.herNameUpper}
          </button>

          <div className="flex items-center gap-5 md:gap-8 text-[11px]">
            {[
              { id: 'about', label: 'STORY' },
              { id: 'work', label: 'MEMORIES' },
              { id: 'love-letter', label: 'LOVE LETTER' },
              { id: 'contact', label: 'APOLOGY' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(`#${item.id}`)}
                className={`transition-colors ${
                  activeNav === item.id ? 'text-[#c4b5fd]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {/* 1px Purple-to-Green Scroll Progress Bar */}
        <div
          ref={progressBarRef}
          className="h-[1.5px] bg-gradient-to-r from-[#c4b5fd] to-[#86efac] origin-left w-full"
          style={{ transform: 'scaleX(0)' }}
        />
      </nav>

      {/* HERO (#top) */}
      <header
        id="top"
        className="relative h-[100svh] w-full flex flex-col justify-end overflow-hidden bg-[#070709]"
      >
        {/* Three.js Purple & Green Particle Terrain */}
        {introDone && <HeroCanvas />}

        {/* Top & Bottom Vignette */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#070709] via-transparent to-[#070709]/95 pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Bottom Metadata + Edge-to-Edge Wordmark */}
        <div className="relative z-20 w-full px-4 md:px-10 pb-4 md:pb-6 pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-center font-mono-label text-[11px] md:text-xs tracking-[0.14em] uppercase text-zinc-400 mb-3 md:mb-4 border-t border-white/10 pt-4">
            <div className="hero-fade text-[#c4b5fd]">{siteContent.hero.leftMeta}</div>
            <div className="hero-fade md:text-center text-zinc-300">{siteContent.hero.centerMeta}</div>
            <div className="hero-fade md:text-right flex md:justify-end items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-[#86efac] animate-pulse" />
              <span>{siteContent.hero.rightMeta}</span>
            </div>
          </div>

          <h1
            className="w-full text-[16.4vw] leading-[0.84] font-bold tracking-[-0.04em] uppercase text-white flex justify-between select-none"
            aria-label={siteContent.herNameUpper}
          >
            {heroChars.map((ch, idx) => (
              <span key={idx} className="inline-block overflow-clip">
                <span className="hero-char inline-block">{ch}</span>
              </span>
            ))}
          </h1>
        </div>
      </header>

      {/* 01 / ABOUT HER */}
      <section id="about" className="relative py-28 md:py-40 px-6 md:px-10 max-w-6xl mx-auto">
        <p className="font-mono-label text-xs tracking-[0.2em] uppercase text-[#f0b4df]/75 mb-10">
          {siteContent.about.eyebrow}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_290px] gap-12 md:gap-16 items-start">
          <p className="text-2xl sm:text-3xl md:text-[2.35rem] leading-[1.35] font-normal tracking-[-0.015em] text-zinc-100">
            {aboutWords.map((word, idx) => (
              <span key={idx} className="scrub-word inline-block mr-[0.28em]">
                {word}
              </span>
            ))}
          </p>

          <div className="about-portrait aspect-[9/16] max-w-[270px] w-full mx-auto md:mx-0 rounded-2xl overflow-hidden">
            <PhotoPlaceholder
              src={siteContent.about.photo}
              alt="Nanki and Samar"
              slot={siteContent.about.photoLabel}
              caption={siteContent.about.photoHint}
              grayscaleScrub
            />
          </div>
        </div>
      </section>

      {/* DUAL-ROW INFINITE MARQUEE */}
      <section aria-label="Birthday feelings marquee" className="py-12 border-y border-white/10 overflow-hidden bg-[#070709]">
        <div className="animate-marquee mb-3">
          {[...siteContent.marqueeItems, ...siteContent.marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 mx-4">
              <span className="text-4xl md:text-6xl font-bold tracking-tight uppercase text-zinc-600 hover:text-white transition-colors">
                {item}
              </span>
              <span className="text-[#86efac] text-xl md:text-2xl">&bull;</span>
            </div>
          ))}
        </div>

        <div className="animate-marquee-reverse">
          {[...siteContent.marqueeItems, ...siteContent.marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 mx-4">
              <span className="text-4xl md:text-6xl font-bold tracking-tight uppercase text-stroke-purple">
                {item}
              </span>
              <span className="text-[#c4b5fd]/40 text-xl md:text-2xl">&bull;</span>
            </div>
          ))}
        </div>
      </section>

      {/* 02 / MEMORIES (STICKY STACKING CARDS) */}
      <section id="work" className="py-28 md:py-40 px-6 md:px-10 max-w-6xl mx-auto">
        <p className="font-mono-label text-xs tracking-[0.2em] uppercase text-[#f0b4df]/75 mb-4">
          02 / CHERISHED MOMENTS
        </p>
        <div className="overflow-clip mb-16 md:mb-24">
          <h2
            data-heading="true"
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Moments I still <em className="font-serif-italic text-[#f0b4df]">cherish.</em>
          </h2>
        </div>

        <div className="space-y-12 md:space-y-16">
          {siteContent.memories.map((mem, i) => (
            <article
              key={mem.id}
              data-stack="true"
              style={{ top: `calc(5.5rem + ${i * 1.15}rem)` }}
              className="sticky origin-top rounded-3xl bg-[#0e0e13] border border-white/10 overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-[1.45fr_1fr] min-h-[70vh] md:h-[76vh]"
            >
              {/* Left: Photo Frame */}
              <div className="p-4 md:p-6 h-64 md:h-full">
                <PhotoPlaceholder
                  src={mem.photo}
                  alt={mem.title}
                  slot={mem.photoSlot}
                  caption={mem.photoCaption}
                  cursorLabel="VIEW ↗"
                  className="rounded-2xl"
                />
              </div>

              {/* Right: Memory Details */}
              <div className="p-7 md:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
                <div>
                  <span className="font-mono-label text-xs tracking-[0.2em] text-[#f0b4df]">
                    {mem.counter}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
                    {mem.title}
                  </h3>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    {mem.description}
                  </p>
                </div>

                <div className="space-y-6 mt-8">
                  <div className="flex flex-wrap gap-2">
                    {mem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] font-mono-label text-[11px] uppercase tracking-wider text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    data-magnetic="true"
                    onClick={() => setSelectedMemory(mem)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f0b4df] text-black font-mono-label text-xs font-semibold uppercase tracking-wider hover:scale-105 transition-transform"
                  >
                    Read memory &nearr;
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 03 / A LOVE LETTER (IN BETWEEN) */}
      <section id="love-letter" className="relative py-28 md:py-40 px-6 md:px-10 max-w-5xl mx-auto">
        <p className="font-mono-label text-xs tracking-[0.2em] uppercase text-[#f0b4df]/75 mb-4">
          {siteContent.loveLetter.eyebrow}
        </p>
        <div className="overflow-clip mb-14">
          <h2
            data-heading="true"
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            {siteContent.loveLetter.headingPrimary}{' '}
            <em className="font-serif-italic text-[#f0b4df]">{siteContent.loveLetter.headingItalic}</em>
          </h2>
        </div>

        <div className="relative rounded-3xl bg-[#0e0e13] border border-white/10 p-8 md:p-16 overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#c4b5fd]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#86efac]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-7">
            <p className="love-para font-serif-italic text-3xl md:text-4xl text-[#f0b4df]">
              {siteContent.loveLetter.salutation}
            </p>

            {siteContent.loveLetter.paragraphs.map((para, i) => (
              <p
                key={i}
                className="love-para text-lg md:text-xl leading-[1.75] text-zinc-200 font-light"
              >
                {para}
              </p>
            ))}

            <div className="love-para pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="font-serif-italic text-2xl md:text-3xl text-white">
                {siteContent.loveLetter.signoff}
              </span>
              <span className="font-mono-label text-[11px] tracking-[0.18em] uppercase text-zinc-500">
                December 1
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 04 / LITTLE THINGS (ASYMMETRIC BENTO GRID) */}
      <section id="wins" className="py-24 md:py-36 px-6 md:px-10 max-w-6xl mx-auto">
        <p className="font-mono-label text-xs tracking-[0.2em] uppercase text-[#f0b4df]/75 mb-4">
          04 / LITTLE MILESTONES
        </p>
        <div className="overflow-clip mb-14">
          <h2
            data-heading="true"
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Proof of <em className="font-serif-italic text-[#f0b4df]">you.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {siteContent.milestones.map((item) => (
            <div
              key={item.id}
              data-reveal="true"
              className={`${item.colSpan} group rounded-3xl bg-[#0e0e13] border border-white/10 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#86efac]/50`}
            >
              <div className="h-52 md:h-60 rounded-2xl overflow-hidden mb-5">
                <PhotoPlaceholder
                  src={item.photo}
                  alt={item.title}
                  slot={item.photoSlot}
                  caption="Us"
                  cursorLabel="PHOTO"
                  className="rounded-2xl"
                />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#f0b4df]/10 border border-[#f0b4df]/30 font-mono-label text-[10px] uppercase tracking-widest text-[#f0b4df] mb-3">
                  {item.badge}
                </span>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-[#f0b4df] transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm mt-1.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 / TIMELINE (VERTICAL SCROLL-DRAWN LINE) */}
      <section id="journey" className="py-24 md:py-36 px-6 md:px-10 max-w-5xl mx-auto">
        <p className="font-mono-label text-xs tracking-[0.2em] uppercase text-[#f0b4df]/75 mb-14">
          05 / OUR CHAPTERS
        </p>

        <div className="relative pl-8 md:pl-12 space-y-14">
          {/* Vertical animated line */}
          <div
            data-line="true"
            className="absolute left-0 top-0 bottom-0 w-[2px] origin-top bg-gradient-to-b from-[#f0b4df] via-[#f0b4df]/40 to-transparent"
          />

          {siteContent.journey.map((step, i) => (
            <div key={i} data-reveal="true" className="relative">
              <span className="absolute -left-[37px] md:-left-[53px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#f0b4df] ring-4 ring-[#050505]" />
              <span className="font-mono-label text-xs uppercase tracking-[0.18em] text-[#f0b4df]">
                {step.date}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">
                {step.title}{' '}
                <span className="text-zinc-500 font-normal text-lg md:text-2xl">{step.org}</span>
              </h3>
              <p className="text-zinc-400 mt-2 max-w-2xl leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS COUNTER BAND */}
      <section className="border-y border-white/10 py-20 px-6 md:px-10 bg-[#070709]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {siteContent.stats.map((stat, i) => (
            <div key={i}>
              <div
                data-count={stat.value}
                data-suffix={stat.suffix}
                className="text-6xl md:text-8xl font-bold tracking-tighter text-white tabular-nums"
              >
                0{stat.suffix}
              </div>
              <p className="font-mono-label text-xs uppercase tracking-[0.18em] text-zinc-400 mt-3">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 06 / HONEST APOLOGY LETTER AT THE END (#contact) */}
      <section id="contact" className="relative py-36 md:py-48 px-6 md:px-10 overflow-hidden">
        <div className="contact-glow absolute inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="font-mono-label text-xs tracking-[0.2em] uppercase text-[#f0b4df]/75 mb-6">
            {siteContent.apologyLetter.eyebrow}
          </p>

          <div className="overflow-clip mb-10">
            <h2
              data-heading="true"
              className="text-5xl sm:text-7xl md:text-[8.5vw] font-bold tracking-tight leading-[0.95]"
            >
              {siteContent.apologyLetter.headingPrimary}
              <br />
              <em className="font-serif-italic text-[#f0b4df]">
                {siteContent.apologyLetter.headingItalic}
              </em>
            </h2>
          </div>

          {/* Interactive Dot-Particle Canvas (Hover to scatter, Click to burst) */}
          <ParticleContact
            text={siteContent.apologyLetter.particlePhrase}
            onParticleClick={() => setApologyOpen(true)}
          />

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              data-magnetic="true"
              onClick={() => setApologyOpen((prev) => !prev)}
              className="px-8 py-4 rounded-full bg-white text-black font-medium text-sm md:text-base hover:scale-105 transition-transform"
            >
              {apologyOpen ? 'Hide apology letter ↑' : 'Read my apology letter ↗'}
            </button>
          </div>

          {/* Sincere Cheating Apology Letter */}
          <div
            className={`mt-14 text-left max-w-3xl mx-auto rounded-3xl bg-[#0e0e13] border border-white/15 p-8 md:p-14 transition-all duration-700 ${
              apologyOpen ? 'opacity-100 translate-y-0' : 'opacity-95'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8 font-mono-label text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <span>HONESTLY &amp; WITHOUT EXCUSES</span>
              <span className="text-[#f0b4df]">FOR NANKI</span>
            </div>

            <div className="space-y-5 text-zinc-200 text-base md:text-lg leading-[1.8] font-light">
              {siteContent.apologyLetter.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={
                    p === 'I cheated on you.'
                      ? 'text-white font-semibold text-xl md:text-2xl py-2 border-l-2 border-[#f0b4df] pl-4'
                      : idx === 0
                      ? 'font-serif-italic text-2xl md:text-3xl text-[#f0b4df]'
                      : ''
                  }
                >
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="font-serif-italic text-2xl text-white">
                {siteContent.apologyLetter.signoff}
              </span>
              <span className="font-mono-label text-[11px] tracking-[0.18em] uppercase text-zinc-500">
                Happy Birthday, {siteContent.herName}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 pt-10 pb-4 px-4 md:px-10 overflow-hidden bg-[#070709]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-label text-xs uppercase tracking-[0.18em] text-zinc-400 mb-6">
          <span>
            For {siteContent.herName} &bull; {siteContent.birthdayDate}
          </span>
          <button
            type="button"
            onClick={() => scrollTo('#top')}
            className="hover:text-[#86efac] transition-colors"
          >
            Back to top &uarr;
          </button>
        </div>

        <div
          className="w-full text-[16.4vw] leading-[0.84] font-bold tracking-[-0.04em] uppercase text-stroke-footer flex justify-between select-none"
          aria-hidden="true"
        >
          {heroChars.map((ch, idx) => (
            <span key={idx}>{ch}</span>
          ))}
        </div>
      </footer>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div
          className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="max-w-lg w-full rounded-3xl bg-[#09090b] border border-white/15 p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMemory(null)}
              aria-label="Close memory"
              className="absolute top-6 right-6 w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <span className="font-mono-label text-xs tracking-[0.2em] text-[#f0b4df]">
              {selectedMemory.counter}
            </span>
            <h3 className="text-3xl font-bold tracking-tight mt-3 mb-4">{selectedMemory.title}</h3>
            <p className="text-zinc-300 leading-relaxed mb-6">{selectedMemory.description}</p>
            <div className="h-56 rounded-2xl overflow-hidden">
              <PhotoPlaceholder
                src={selectedMemory.photo}
                alt={selectedMemory.title}
                slot={selectedMemory.photoSlot}
                caption={selectedMemory.photoCaption}
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
