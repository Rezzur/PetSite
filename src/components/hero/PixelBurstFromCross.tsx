import { type CSSProperties } from 'react';
import { buildBurstParticles } from '../../utils/ascii';

const particles = buildBurstParticles(22);

export default function PixelBurstFromCross() {
  return (
    <div className="pixel-burst" aria-hidden="true">
      {particles.map((particle) => (
        <span
          className="burst-particle"
          key={particle.id}
          style={
            {
              '--angle': `${particle.angle}deg`,
              '--distance': `${particle.distance}px`,
              animationDelay: `${particle.delay}s`
            } as CSSProperties
          }
        >
          {particle.char}
        </span>
      ))}
    </div>
  );
}
