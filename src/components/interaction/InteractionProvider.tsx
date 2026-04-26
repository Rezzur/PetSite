import { createContext, type MutableRefObject, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export type PointerState = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  active: boolean;
  lastClickX: number;
  lastClickY: number;
  lastClickAt: number;
};

export type InteractionContextValue = {
  pointer: MutableRefObject<PointerState>;
  reducedMotion: boolean;
  finePointer: boolean;
};

export const InteractionContext = createContext<InteractionContextValue | null>(null);

type InteractionProviderProps = {
  children: ReactNode;
};

export function InteractionProvider({ children }: InteractionProviderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<PointerState>({
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    active: false,
    lastClickX: 0,
    lastClickY: 0,
    lastClickAt: 0
  });
  const reducedMotion = usePrefersReducedMotion();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)');
    const update = () => setFinePointer(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || !finePointer) {
      return undefined;
    }

    let frame = 0;

    const writePointer = (event: PointerEvent) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      pointer.current.rx = event.clientX / window.innerWidth - 0.5;
      pointer.current.ry = event.clientY / window.innerHeight - 0.5;
      pointer.current.active = true;

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty('--pointer-x', `${pointer.current.x}px`);
        root.style.setProperty('--pointer-y', `${pointer.current.y}px`);
        root.style.setProperty('--pointer-rx', pointer.current.rx.toFixed(4));
        root.style.setProperty('--pointer-ry', pointer.current.ry.toFixed(4));
        root.style.setProperty('--glow-x', `calc(50% + ${pointer.current.rx * 12}px)`);
        root.style.setProperty('--glow-y', `calc(42% + ${pointer.current.ry * 10}px)`);
        root.style.setProperty('--shift-x', `${pointer.current.rx * 8}px`);
        root.style.setProperty('--shift-y', `${pointer.current.ry * 8}px`);
        root.style.setProperty('--shift-x-inverse', `${pointer.current.rx * -7}px`);
        root.style.setProperty('--shift-y-inverse', `${pointer.current.ry * -6}px`);
        root.style.setProperty('--shift-x-large', `${pointer.current.rx * 10}px`);
        root.style.setProperty('--shift-y-large', `${pointer.current.ry * 10}px`);
      });
    };

    const clearPointer = () => {
      pointer.current.active = false;
    };

    const writeClick = (event: PointerEvent) => {
      pointer.current.lastClickX = event.clientX;
      pointer.current.lastClickY = event.clientY;
      pointer.current.lastClickAt = performance.now();
      root.style.setProperty('--click-x', `${event.clientX}px`);
      root.style.setProperty('--click-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', writePointer, { passive: true });
    window.addEventListener('pointerdown', writeClick, { passive: true });
    window.addEventListener('pointerleave', clearPointer);

    return () => {
      window.removeEventListener('pointermove', writePointer);
      window.removeEventListener('pointerdown', writeClick);
      window.removeEventListener('pointerleave', clearPointer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [finePointer, reducedMotion]);

  const value = useMemo(
    () => ({
      pointer,
      reducedMotion,
      finePointer
    }),
    [finePointer, reducedMotion]
  );

  return (
    <InteractionContext.Provider value={value}>
      <div className="interaction-root" ref={rootRef}>
        {children}
      </div>
    </InteractionContext.Provider>
  );
}
