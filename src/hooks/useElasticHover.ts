import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePointer } from './usePointer';

type ElasticHoverOptions = {
  scale?: number;
  disabled?: boolean;
};

export function useElasticHover<T extends HTMLElement>({ scale = 1.015, disabled = false }: ElasticHoverOptions = {}) {
  const ref = useRef<T | null>(null);
  const { reducedMotion, finePointer } = usePointer();

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled || reducedMotion || !finePointer) return undefined;

    const enter = () => {
      gsap.fromTo(
        element,
        { scale: 1 },
        {
          scale,
          duration: 0.18,
          ease: 'power3.out'
        }
      );
    };

    const leave = () => {
      gsap.to(element, { scale: 1, duration: 0.48, ease: 'elastic.out(1, 0.75)' });
    };

    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);

    return () => {
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(element);
    };
  }, [disabled, finePointer, reducedMotion, scale]);

  return ref;
}
