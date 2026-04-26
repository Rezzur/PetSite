import { type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePointer } from '../../hooks/usePointer';
import { clamp } from '../../utils/motion';

type SpotlightSurfaceProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: 'article' | 'div';
  tilt?: boolean;
};

export function SpotlightSurface({
  as = 'div',
  children,
  className = '',
  tilt = true,
  ...props
}: SpotlightSurfaceProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { reducedMotion, finePointer } = usePointer();
  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion || !finePointer) return undefined;

    const rotateXTo = gsap.quickTo(element, 'rotateX', { duration: 0.38, ease: 'power3.out' });
    const rotateYTo = gsap.quickTo(element, 'rotateY', { duration: 0.38, ease: 'power3.out' });
    const scaleTo = gsap.quickTo(element, 'scale', { duration: 0.34, ease: 'power3.out' });

    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const xPercent = clamp((localX / rect.width) * 100, 0, 100);
      const yPercent = clamp((localY / rect.height) * 100, 0, 100);

      element.style.setProperty('--spotlight-x', `${xPercent}%`);
      element.style.setProperty('--spotlight-y', `${yPercent}%`);

      if (!tilt) return;
      rotateXTo(clamp((0.5 - localY / rect.height) * 5, -3.5, 3.5));
      rotateYTo(clamp((localX / rect.width - 0.5) * 5, -3.5, 3.5));
      scaleTo(1.012);
    };

    const leave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.56,
        ease: 'elastic.out(1, 0.72)'
      });
      element.style.setProperty('--spotlight-x', '50%');
      element.style.setProperty('--spotlight-y', '0%');
    };

    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', leave);
    gsap.set(element, { transformPerspective: 820, transformOrigin: '50% 50%' });

    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(element);
    };
  }, [finePointer, reducedMotion, tilt]);

  if (as === 'article') {
    return (
      <article className={`spotlight-surface ${className}`} ref={setRef} {...props}>
        {children}
      </article>
    );
  }

  return (
    <div className={`spotlight-surface ${className}`} ref={setRef} {...props}>
      {children}
    </div>
  );
}
