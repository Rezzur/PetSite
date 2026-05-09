import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePointer } from './usePointer';
import { clamp } from '../utils/motion';

type MagneticOptions = {
  strength?: number;
  radius?: number;
  disabled?: boolean;
};

export function useMagnetic<T extends HTMLElement>({ strength = 9, radius = 112, disabled = false }: MagneticOptions = {}) {
  const ref = useRef<T | null>(null);
  const { reducedMotion, finePointer } = usePointer();

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled || reducedMotion || !finePointer) return undefined;

    const xTo = gsap.quickTo(element, 'x', { duration: 0.36, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.36, ease: 'power3.out' });
    const rotateTo = gsap.quickTo(element, 'rotate', { duration: 0.42, ease: 'power3.out' });

    const reset = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.58,
        ease: 'elastic.out(1, 0.72)'
      });
    };

    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance > radius) {
        reset();
        return;
      }

      const pull = 1 - distance / radius;
      const x = clamp((dx / radius) * strength * pull, -strength, strength);
      const y = clamp((dy / radius) * strength * pull, -strength, strength);
      xTo(x);
      yTo(y);
      rotateTo(clamp(x * 0.16, -1.5, 1.5));
    };

    window.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', reset);

    return () => {
      window.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      gsap.killTweensOf(element);
    };
  }, [disabled, finePointer, radius, reducedMotion, strength]);

  return ref;
}
