import { RefObject, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Reveal content once, including asynchronously mounted route results. */
export function useScrollReveal(root: RefObject<HTMLElement | null>, routeKey: string) {
  useLayoutEffect(() => {
    if (!root.current) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const registered = new Set<Element>();
      const animations: gsap.core.Tween[] = [];
      const register = () => {
        root.current?.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
          if (registered.has(element)) return;
          registered.add(element);
          const tween = gsap.fromTo(element,
            { y: 28, opacity: 0.3 },
            { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', immediateRender: false,
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger: element, start: 'top 94%', once: true },
            });
          animations.push(tween);
        });
      };
      register();
      const observer = new MutationObserver(register);
      observer.observe(root.current!, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        animations.forEach(tween => { tween.scrollTrigger?.kill(); tween.revert(); });
      };
    });
    return () => media.revert();
  }, [root, routeKey]);
}
