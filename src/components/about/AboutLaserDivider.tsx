import { lazy, Suspense, useState } from 'react';
import { usePointer } from '../../hooks/usePointer';

const LaserFlow = lazy(() => import('./LaserFlow'));

function StaticLaserDivider() {
  return (
    <div className="about-laser-divider about-laser-divider--static" aria-hidden="true">
      <span className="about-laser-divider__rail" />
      <span className="about-laser-divider__core" />
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
      <Suspense fallback={<span className="about-laser-divider__core" />}>
        <LaserFlow
          color="#ffffff"
          decay={0.72}
          dpr={1}
          falloffStart={0.96}
          flowStrength={0.22}
          fogScale={0.055}
          horizontalSizing={0.74}
          onSceneError={() => setSceneFailed(true)}
          verticalSizing={4.35}
          wispDensity={3.2}
          wispIntensity={7.5}
          wispSpeed={9.5}
        />
      </Suspense>
    </div>
  );
}
