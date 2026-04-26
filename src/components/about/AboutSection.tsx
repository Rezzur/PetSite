import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePointer } from '../../hooks/usePointer';
import AboutCopy from './AboutCopy';
import TeamCards from './TeamCards';

gsap.registerPlugin(useGSAP);

export default function AboutSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const { reducedMotion } = usePointer();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const revealItems = gsap.utils.toArray<HTMLElement>('.about-reveal', root);

      if (reducedMotion) {
        gsap.set(revealItems, { opacity: 1, y: 0, scale: 1 });
        return undefined;
      }

      gsap.set(revealItems, { opacity: 0, y: 22, scale: 0.985 });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            gsap.to(revealItems, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.82,
              stagger: 0.12,
              ease: 'elastic.out(1, 0.72)'
            });
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -12% 0px' }
      );

      observer.observe(root);

      return () => observer.disconnect();
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <section className="about-section" id="about" ref={rootRef}>
      <div className="about-grid">
        <div className="about-reveal">
          <AboutCopy />
        </div>
        <div className="about-reveal about-cards-panel">
          <TeamCards />
        </div>
      </div>
    </section>
  );
}
