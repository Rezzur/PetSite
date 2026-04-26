import { type HTMLAttributes, type ReactNode, useCallback } from 'react';
import { useElasticHover } from '../../hooks/useElasticHover';
import { useMagnetic } from '../../hooks/useMagnetic';

type MagneticSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  magneticStrength?: number;
  magneticRadius?: number;
  disabled?: boolean;
};

export function MagneticSurface({
  children,
  className = '',
  magneticStrength,
  magneticRadius,
  disabled,
  ...props
}: MagneticSurfaceProps) {
  const magneticRef = useMagnetic<HTMLDivElement>({
    strength: magneticStrength,
    radius: magneticRadius,
    disabled
  });
  const elasticRef = useElasticHover<HTMLDivElement>({ disabled });

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      magneticRef.current = node;
      elasticRef.current = node;
    },
    [elasticRef, magneticRef]
  );

  return (
    <div className={`magnetic-surface ${className}`} ref={setRef} {...props}>
      {children}
    </div>
  );
}
