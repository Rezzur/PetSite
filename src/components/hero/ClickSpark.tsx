import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { usePointer } from '../../hooks/usePointer';

type Spark = {
  x: number;
  y: number;
  angle: number;
  startTime: number;
};

type ClickSparkProps = {
  children: ReactNode;
  className?: string;
  sparkCount?: number;
  sparkRadius?: number;
  duration?: number;
};

export default function ClickSpark({ children, className = '', sparkCount = 8, sparkRadius = 28, duration = 380 }: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animationRef = useRef<number | null>(null);
  const { reducedMotion } = usePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return undefined;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    resize();

    return () => observer.disconnect();
  }, []);

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = progress * (2 - progress);
        const distance = eased * sparkRadius;
        const length = 11 * (1 - eased);
        const x1 = spark.x + Math.cos(spark.angle) * distance;
        const y1 = spark.y + Math.sin(spark.angle) * distance;
        const x2 = spark.x + Math.cos(spark.angle) * (distance + length);
        const y2 = spark.y + Math.sin(spark.angle) * (distance + length);

        ctx.strokeStyle = `rgba(255,255,255,${1 - progress})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      if (sparksRef.current.length > 0) {
        animationRef.current = window.requestAnimationFrame(draw);
      } else {
        animationRef.current = null;
      }
    },
    [duration, sparkRadius]
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const startTime = performance.now();

    sparksRef.current.push(
      ...Array.from({ length: sparkCount }, (_, index) => ({
        x,
        y,
        angle: (Math.PI * 2 * index) / sparkCount,
        startTime
      }))
    );

    if (!animationRef.current) {
      animationRef.current = window.requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className={`click-spark ${className}`} onClick={handleClick} ref={wrapperRef}>
      <canvas aria-hidden="true" className="click-spark__canvas" ref={canvasRef} />
      {children}
    </div>
  );
}
