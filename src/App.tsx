import { useLayoutEffect } from 'react';
import AboutSection from './components/about/AboutSection';
import ContactsSection from './components/contacts/ContactsSection';
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
      <main id="main" className="app-main">
        <HeroSection />
        <AboutSection />
        <WorksSection />
        <ContactsSection />
      </main>
    </InteractionProvider>
  );
}
