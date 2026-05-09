import { lazy, Suspense, useState } from 'react';
import { usePointer } from '../../hooks/usePointer';

const LaserFlow = lazy(() => import('./LaserFlow'));

function StaticLaserDivider() {
  return (
    <div className="about-laser-divider about-laser-divider--static" aria-hidden="true">
      <span className="about-laser-divider__rail" />
      <span className="about-laser-divider__core" />
      <span className="about-laser-divider__impact" />
    </div>
  );
}

export default function AboutLaserDivider() {
  const { reducedMotion } = usePointer();
  const [sceneFailed, setSceneFailed] = useState(false);

  if (reducedMotion || sceneFailed) {
    return <StaticLaserDivider />;
  }

  return (
    <div className="about-laser-divider" aria-hidden="true">
      <span className="about-laser-divider__rail" />
      <span className="about-laser-divider__impact" />
      <Suspense fallback={<span className="about-laser-divider__core" />}>
        <LaserFlow
          color="#ffffff"
          decay={0.56}
          dpr={1}
          falloffStart={1.16}
          flowStrength={0.32}
          fogScale={0.095}
          horizontalSizing={1.05}
          onSceneError={() => setSceneFailed(true)}
          verticalSizing={5.2}
          wispDensity={4.6}
          wispIntensity={14}
          wispSpeed={12.5}
        />
      </Suspense>
    </div>
  );
}
