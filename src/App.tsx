import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import AboutSection from './components/about/AboutSection';
import ContactsSection from './components/contacts/ContactsSection';
import HeroSection from './components/hero/HeroSection';
import { InteractionProvider } from './components/interaction/InteractionProvider';
import TopAsciiBar from './components/navigation/TopAsciiBar';
import WorksSection from './components/works/WorksSection';
import { scrollToPageSection } from './utils/scroll';

type DeveloperId = 'yan' | 'sergey';
type HomeSection = 'top' | 'developers' | 'works' | 'contacts';

const developerPaths: Record<DeveloperId, string> = {
  yan: '/developers/yan',
  sergey: '/developers/sergey'
};

function getKnownPathname() {
  const pathname = window.location.pathname;

  if (pathname === developerPaths.yan || pathname === developerPaths.sergey) return pathname;

  return '/';
}

function getDeveloperId(pathname: string): DeveloperId | undefined {
  if (pathname === developerPaths.yan) return 'yan';
  if (pathname === developerPaths.sergey) return 'sergey';

  return undefined;
}

export default function App() {
  const [pathname, setPathname] = useState(getKnownPathname);
  const [pendingSection, setPendingSection] = useState<HomeSection | null>(null);
  const [hasPlayedHeroIntro, setHasPlayedHeroIntro] = useState(() => getKnownPathname() !== '/');
  const developerId = getDeveloperId(pathname);
  const isDeveloperPage = developerId !== undefined;

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      setPathname(getKnownPathname());
    };

    window.addEventListener('popstate', syncRoute);

    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useLayoutEffect(() => {
    if (isDeveloperPage) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (!pendingSection) return;

    if (pendingSection === 'top') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new CustomEvent('page-section-scroll', { detail: { id: 'top' } }));
      setPendingSection(null);
      return;
    }

    const scrollToPendingSection = () => {
      scrollToPageSection(`#${pendingSection}`);
      setPendingSection(null);
    };

    const hero = document.querySelector<HTMLElement>('.hero-section');
    if (hero && !hero.classList.contains('is-ready')) {
      const observer = new MutationObserver(() => {
        if (!hero.classList.contains('is-ready')) return;
        observer.disconnect();
        window.requestAnimationFrame(scrollToPendingSection);
      });

      observer.observe(hero, { attributes: true, attributeFilter: ['class'] });

      return () => observer.disconnect();
    }

    const frame = window.requestAnimationFrame(scrollToPendingSection);

    return () => window.cancelAnimationFrame(frame);
  }, [isDeveloperPage, pendingSection]);

  const navigateHomeSection = useCallback((section: HomeSection) => {
    if (window.location.pathname !== '/') {
      setHasPlayedHeroIntro(true);
      window.history.pushState(null, '', '/');
      setPathname('/');
      setPendingSection(section);
      return;
    }

    setPendingSection(null);

    if (section === 'top') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new CustomEvent('page-section-scroll', { detail: { id: 'top' } }));
      return;
    }

    scrollToPageSection(`#${section}`);
  }, []);

  const navigateDeveloper = useCallback((nextDeveloperId: DeveloperId) => {
    const nextPath = developerPaths[nextDeveloperId];

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    setHasPlayedHeroIntro(true);
    setPendingSection(null);
    setPathname(nextPath);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleHeroIntroComplete = useCallback(() => {
    setHasPlayedHeroIntro(true);
  }, []);

  return (
    <InteractionProvider>
      <TopAsciiBar
        developerId={developerId}
        page={isDeveloperPage ? 'developer' : 'home'}
        onNavigateDeveloper={navigateDeveloper}
        onNavigateHomeSection={navigateHomeSection}
      />

      {isDeveloperPage ? (
        <main id="main" className="developer-page" aria-label="Страница разработчика" />
      ) : (
        <main id="main" className="app-main">
          <HeroSection skipIntro={hasPlayedHeroIntro} onIntroComplete={handleHeroIntroComplete} />
          <AboutSection onNavigateDeveloper={navigateDeveloper} />
          <WorksSection />
          <ContactsSection />
        </main>
      )}
    </InteractionProvider>
  );
}
