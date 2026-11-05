import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, MoveUpRight, Accessibility, TrainFront, Footprints, Route } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage = () => {
  const root = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const reducedMotion = useReducedMotion();
  const [stepFree, setStepFree] = useState(true);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const context = gsap.context(() => {
      gsap.from('.hero-reveal', { y: 28, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out' });
      gsap.to('.approach-list', { '--route-progress': 1, ease: 'none', scrollTrigger: { trigger: '.approach-list', start: 'top 80%', end: 'bottom 65%', scrub: 0.5 } });
      gsap.from('.atlas', { opacity: 0, y: 24, duration: 1.3, delay: 0.25, ease: 'power3.out' });
    }, root);
    return () => context.revert();
  }, [reducedMotion]);

  useLayoutEffect(() => {
    if (!route.current || reducedMotion) return;
    const length = route.current.getTotalLength();
    const tween = gsap.fromTo(route.current, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
    return () => { tween.revert(); };
  }, [stepFree, reducedMotion]);

  return (
    <div ref={root} className="ezpath-home">
      <section className="ezpath-hero page-width">
        <div className="hero-copy">
          <h1 className="hero-reveal">A city of<br />possibilities.<br /><span>Yours to explore.</span></h1>
          <p className="hero-reveal hero-description">The best route is the one that works for you. Discover journeys shaped around your mobility, your pace, and your everyday.</p>
          <div className="hero-reveal hero-actions">
            <Link to="/plan" className="ezpath-button">Plan your journey <ArrowUpRight size={19} /></Link>
            <a href="#the-ezpath-way" className="text-link">The Ezpath way <ArrowDown size={16} /></a>
          </div>
          <div className="hero-reveal hero-note"><span className="note-line" /><span>More freedom. Fewer barriers.</span></div>
        </div>
        <div className="atlas">
          <div className="atlas-heading"><span><span className="status-dot" /> A different way through</span><span>DEMO JOURNEY</span></div>
          <svg className="city-map" viewBox="0 60 620 550" role="img" aria-label={stepFree ? 'Illustrative step-free route from Central Station via the west elevator to Riverside Campus' : 'Illustrative direct route with stairs between Central Station and Riverside Campus'}>
            <defs><pattern id="city-blocks" width="100" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)"><rect x="9" y="9" width="80" height="69" rx="6" fill="#e3e8df" /><rect x="16" y="16" width="66" height="55" rx="3" fill="none" stroke="#d7dfd4" /></pattern></defs>
            <rect width="620" height="550" fill="#eff1e9" />
            <rect width="620" height="550" fill="url(#city-blocks)" />
            <path d="M485 -35 C355 105 570 175 445 300 S420 490 570 600" fill="none" stroke="#cadbd8" strokeWidth="83" />
            <path d="M485 -35 C355 105 570 175 445 300 S420 490 570 600" fill="none" stroke="#e5eeea" strokeWidth="2" />
            <path d="M-30 365 L650 40 M-20 175 L650 490 M220 -30 L30 550" fill="none" stroke="#f8f9f3" strokeWidth="21" />
            <path d="M-30 365 L650 40 M-20 175 L650 490" fill="none" stroke="#d4dbd1" strokeWidth="1" />
            <path d="M235 150 L315 112 L355 190 L275 228 Z" fill="#c9d7bc" />
            <text x="290" y="170" textAnchor="middle" className="map-label" transform="rotate(-25 290 170)">GARDEN QUARTER</text>
            <text x="480" y="350" className="river-label" transform="rotate(60 480 350)">RIVERSIDE</text>
            <text x="95" y="440" className="map-label">CENTRAL DISTRICT</text>
            <path d="M125 355 L345 250 L465 195" fill="none" stroke="#b6beb1" strokeWidth="3" strokeDasharray="5 7" />
            <path ref={route} d={stepFree ? 'M125 355 L197 389 Q210 395 222 385 L330 282 Q340 272 354 266 L465 215 L465 195' : 'M125 355 L345 250 L465 195'} fill="none" stroke={stepFree ? '#264c3f' : '#a26643'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="125" cy="355" r="13" fill="#264c3f" stroke="white" strokeWidth="5" />
            <circle cx="465" cy="195" r="13" fill="#264c3f" stroke="white" strokeWidth="5" />
            <rect x="37" y="294" width="151" height="36" rx="5" fill="#fff" /><text x="112" y="317" textAnchor="middle" className="station-label">Central Station</text>
            <rect x="385" y="134" width="184" height="36" rx="5" fill="#fff" /><text x="477" y="157" textAnchor="middle" className="station-label">Riverside Campus</text>
            <circle cx={stepFree ? 245 : 345} cy={stepFree ? 363 : 250} r="15" fill="#fff" stroke={stepFree ? '#264c3f' : '#a26643'} strokeWidth="1.5" />
            <text x={stepFree ? 245 : 345} y={stepFree ? 368 : 255} textAnchor="middle" fill="#264c3f" fontSize="16">{stepFree ? '↕' : '!'}</text>
            <text x={stepFree ? 264 : 360} y={stepFree ? 390 : 278} className="station-label">{stepFree ? 'West elevator' : '24 steps'}</text>
          </svg>
          <div className="map-compass"><MoveUpRight size={22} /><span>N</span></div>
          <div className="journey-preview">
            <div className="preview-top"><span className="preview-icon"><TrainFront size={20} /></span><div><strong>Central → Riverside</strong><span>Metro Blue Line · Example journey</span></div><ArrowUpRight size={19} /></div>
            <div className="route-switch" aria-label="Compare example routes">
              <button aria-pressed={stepFree} onClick={() => setStepFree(true)}>Step-free route</button>
              <button aria-pressed={!stepFree} onClick={() => setStepFree(false)}>Shortest route</button>
            </div>
            <AnimatePresence mode="wait" initial={false}><motion.div key={String(stepFree)} className="preview-result" initial={{ opacity: reducedMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: reducedMotion ? 1 : 0 }} transition={{ duration: 0.15 }} aria-live="polite"><span>{stepFree ? <Check size={15} /> : <Footprints size={15} />}{stepFree ? 'Step-free, all the way' : 'Includes a 24-step staircase'}</span><strong>{stepFree ? '18 min' : '14 min'}</strong></motion.div></AnimatePresence>
          </div>
          <div className="atlas-caption"><span>Designed around you, not just the distance.</span><span>EZ / 01</span></div>
        </div>
      </section>
      <div data-reveal className="principle-strip page-width"><span>Consider every part of the journey.</span><div><span><Accessibility size={18} /> Step-free access</span><span><Footprints size={18} /> Your walking limits</span><span><Route size={18} /> Thoughtful connections</span></div></div>
      <section id="the-ezpath-way" className="approach-section page-width">
        <div data-reveal className="approach-title"><h2>Less uncertainty.<br /><span>More possibility.</span></h2><p>A few extra minutes can make all the difference. Ezpath brings the details that matter into one considered journey.</p><Link className="text-link" to="/plan">Find your way <ArrowRight size={18} /></Link></div>
        <div className="approach-list">{[
          ['Your needs set the route.', 'Choose your mobility profile, walking distance, and budget. Your requirements stay at the heart of every connection.'],
          ['Know what lies ahead.', 'Explore step-free entrances, elevator status, and accessible boarding before you leave. See the evidence behind your route.'],
          ['Plans change. Keep moving.', 'When a disruption affects your journey, compare an alternative with the same accessibility requirements. Save it for offline access.'],
        ].map(([title, description], i) => <article data-reveal key={title}><span className="approach-index">0{i + 1}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
      </section>
      <section className="closing-section"><div data-reveal className="page-width"><div><h2>Your next chapter<br />starts with a journey.</h2><p>Make room for where you want to go.</p></div><Link to="/plan" className="ezpath-button light">Let’s find your route <ArrowUpRight size={20} /></Link></div></section>
    </div>
  );
};
