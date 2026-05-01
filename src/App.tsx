import { useLayoutEffect } from 'react';
import AboutSection from './components/about/AboutSection';
import HeroSection from './components/hero/HeroSection';
import { InteractionProvider } from './components/interaction/InteractionProvider';
import WorksSection from './components/works/WorksSection';

export default function App() {
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  return (
    <InteractionProvider>
      <a className="skip-link" href="#about">
        Перейти к блоку о нас
      </a>
      <main id="main" className="app-main">
        <HeroSection />
        <AboutSection />
        <WorksSection />
      </main>
    </InteractionProvider>
  );
}
