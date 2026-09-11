import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Fade-in + slide-up on mount
 */
export function useGsapFadeIn(options = {}) {
  const ref = useRef(null);
  const { delay = 0, y = 30, duration = 0.7 } = options;

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
    );
  }, []);

  return ref;
}

/**
 * Stagger children on mount
 */
export function useGsapStagger(options = {}) {
  const ref = useRef(null);
  const { delay = 0.1, stagger = 0.06, y = 24, duration = 0.6, selector = ':scope > *' } = options;

  useEffect(() => {
    if (!ref.current) return;
    const children = ref.current.querySelectorAll(selector);
    if (!children.length) return;
    gsap.fromTo(children,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, stagger, ease: 'power3.out' }
    );
  }, []);

  return ref;
}

/**
 * Animate a number counting up
 */
export function useGsapCounter(targetValue, options = {}) {
  const ref = useRef(null);
  const { duration = 1.2, delay = 0.3 } = options;

  useEffect(() => {
    if (!ref.current || typeof targetValue !== 'number') return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: targetValue,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val);
      },
    });
  }, [targetValue]);

  return ref;
}
