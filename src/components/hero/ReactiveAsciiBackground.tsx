import { useEffect, useRef } from 'react';
import { backgroundGlyphs, codeFragments } from '../../data/content';
import { usePointer } from '../../hooks/usePointer';
import { clamp } from '../../utils/motion';

type Cell = {
  char: string;
  x: number;
  y: number;
  seed: number;
  nextAt: number;
};

type Blast = {
  x: number;
  y: number;
  start: number;
};

const chars = [...backgroundGlyphs, ...codeFragments.slice(0, 8)];
const blastChars = ['.', '+', '*', 'x', '0', '1', '#', '_'];

function randomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

export default function ReactiveAsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const cellsRef = useRef<Cell[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false, lastMove: 0 });
  const blastsRef = useRef<Blast[]>([]);
  const hoverBoostRef = useRef(0);
  const { reducedMotion, finePointer } = usePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let cellSize = 18;
    let columns = 0;
    let rows = 0;
    let lastFrame = 0;

    const buildCells = () => {
      cellsRef.current = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          cellsRef.current.push({
            char: randomChar(),
            x: column * cellSize + cellSize * 0.5,
            y: row * cellSize + cellSize * 0.55,
            seed: Math.random(),
            nextAt: performance.now() + 700 + Math.random() * 1800
          });
        }
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      cellSize = width < 680 ? 38 : 22;
      columns = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildCells();
    };

    const draw = (now: number) => {
      const elapsed = now - lastFrame;
      const slowFrame = width < 680 ? 96 : 64;
      if (elapsed < slowFrame && !reducedMotion) {
        frameRef.current = window.requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;

      const scrollCalm = clamp(1 - window.scrollY / Math.max(1, window.innerHeight) * 0.62, 0.32, 1);
      const pointer = pointerRef.current;
      const radius = width < 680 ? 0 : 154;
      const hoverBoost = hoverBoostRef.current;
      const pointerAge = now - pointer.lastMove;
      const pointerFade = pointer.active ? clamp(1 - pointerAge / 620, 0, 1) : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${width < 680 ? 11 : 12}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textBaseline = 'middle';

      for (const cell of cellsRef.current) {
        if (!reducedMotion && now > cell.nextAt) {
          cell.char = randomChar();
          cell.nextAt = now + 850 + Math.random() * (width < 680 ? 4200 : 2600);
        }

        const dx = cell.x - pointer.x;
        const dy = cell.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const rawPointerEnergy = pointer.active && finePointer && radius > 0 ? Math.max(0, 1 - distance / radius) : 0;
        const pointerEnergy = rawPointerEnergy * rawPointerEnergy * pointerFade;
        const centerDx = Math.abs(cell.x - width / 2);
        const centerDy = Math.abs(cell.y - height * 0.46);
        const wordmarkEnergy = hoverBoost * Math.max(0, 1 - Math.hypot(centerDx, centerDy) / 240);
        const normalizedX = (cell.x - width / 2) / Math.max(width * 0.5, 1);
        const normalizedY = (cell.y - height * 0.48) / Math.max(height * 0.5, 1);
        const centerQuiet = clamp(Math.hypot(normalizedX * 1.25, normalizedY * 1.65), 0.1, 1);
        const edgeBoost = 0.58 + clamp(Math.hypot(normalizedX, normalizedY), 0, 1) * 0.78;

        if (!reducedMotion && pointerEnergy > 0.08 && now > cell.nextAt - pointerEnergy * 1700) {
          cell.char = randomChar();
          cell.nextAt = now + 120 + Math.random() * (420 - pointerEnergy * 210);
        } else if (!reducedMotion && (pointerEnergy > 0.82 || wordmarkEnergy > 0.86) && Math.random() > 0.92) {
          cell.char = randomChar();
        }

        let blastEnergy = 0;
        for (const blast of blastsRef.current) {
          const progress = (now - blast.start) / 360;
          if (progress < 0 || progress > 1) continue;
          const blastDistance = Math.hypot(cell.x - blast.x, cell.y - blast.y);
          const ring = Math.abs(blastDistance - progress * 148);
          blastEnergy = Math.max(blastEnergy, Math.max(0, 1 - ring / 14) * (1 - progress));
        }

        const baseAlpha = (0.018 + cell.seed * 0.035) * centerQuiet * edgeBoost;
        const pointerAlpha = pointerEnergy * 0.38 * clamp(centerQuiet + 0.32, 0.32, 1);
        const alpha = (baseAlpha + pointerAlpha + wordmarkEnergy * 0.06 + blastEnergy * 0.5) * scrollCalm;
        ctx.fillStyle = `rgba(255,255,255,${clamp(alpha, 0.012, 0.66)})`;
        ctx.fillText(cell.char, cell.x, cell.y);
      }

      for (const blast of blastsRef.current) {
        const progress = (now - blast.start) / 360;
        if (progress < 0 || progress > 1) continue;

        const alpha = (1 - progress) * 0.34 * scrollCalm;
        const radiusNow = 16 + progress * 124;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(blast.x, blast.y, radiusNow, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255,255,255,${alpha * 1.35})`;
        ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        for (let index = 0; index < 18; index += 1) {
          const angle = (Math.PI * 2 * index) / 18 + blast.start * 0.001;
          const distance = radiusNow * (0.42 + (index % 4) * 0.13);
          const size = index % 2 === 0 ? 2 : 3;
          ctx.fillRect(blast.x + Math.cos(angle) * distance, blast.y + Math.sin(angle) * distance, size, size);
          if (index % 3 === 0) {
            ctx.fillText(
              blastChars[(index + Math.floor(blast.start)) % blastChars.length],
              blast.x + Math.cos(angle) * (distance + 8),
              blast.y + Math.sin(angle) * (distance + 8)
            );
          }
        }
      }

      blastsRef.current = blastsRef.current.filter((blast) => now - blast.start < 380);

      if (!reducedMotion) {
        frameRef.current = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const insideCanvas = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

      pointerRef.current.x = x;
      pointerRef.current.y = y;
      pointerRef.current.active = insideCanvas;
      pointerRef.current.lastMove = performance.now();
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion || !finePointer) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      blastsRef.current.push({
        x,
        y,
        start: performance.now()
      });
    };

    const wordmark = document.querySelector('.wordmark-stack');
    const boostOn = () => {
      hoverBoostRef.current = 1;
    };
    const boostOff = () => {
      hoverBoostRef.current = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement ?? canvas);
    resize();
    draw(performance.now());

    if (!reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('pointerdown', handlePointerDown, { passive: true });
      wordmark?.addEventListener('pointerenter', boostOn);
      wordmark?.addEventListener('pointerleave', boostOff);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      wordmark?.removeEventListener('pointerenter', boostOn);
      wordmark?.removeEventListener('pointerleave', boostOff);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [finePointer, reducedMotion]);

  return <canvas className="reactive-ascii-background" ref={canvasRef} aria-hidden="true" />;
}
