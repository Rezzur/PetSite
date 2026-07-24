import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import catTypingGif from './assets/developers/cat-typing.gif';
import AboutSection from './components/about/AboutSection';
import ContactsSection from './components/contacts/ContactsSection';
import HeroSection from './components/hero/HeroSection';
import { InteractionProvider } from './components/interaction/InteractionProvider';
import TopAsciiBar from './components/navigation/TopAsciiBar';
import WorksSection from './components/works/WorksSection';
import { getPreferredScrollBehavior, scrollToPageSection } from './utils/scroll';

type DeveloperId = 'yan' | 'sergey';
type HomeSection = 'top' | 'developers' | 'works' | 'contacts';

const developerPaths: Record<DeveloperId, string> = {
  yan: '/developers/yan',
  sergey: '/developers/sergey'
};

type AppHistoryState = {
  homeScrollY?: number;
  returnToHome?: boolean;
};

function getHistoryState(value: unknown = window.history.state): AppHistoryState {
  return value && typeof value === 'object' ? (value as AppHistoryState) : {};
}

function readHomeScrollY(value: unknown = window.history.state) {
  const stateScrollY = getHistoryState(value).homeScrollY;
  return typeof stateScrollY === 'number' && Number.isFinite(stateScrollY) ? Math.max(0, stateScrollY) : 0;
}

function saveHomeScrollY() {
  const homeScrollY = Math.max(0, window.scrollY);

  window.history.replaceState({ ...getHistoryState(), homeScrollY }, '');
  return homeScrollY;
}

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

type DeveloperPageProps = {
  developerId: DeveloperId;
  onReturnHome: () => void;
};

function DeveloperProfilePage({ developerId, onReturnHome }: DeveloperPageProps) {
  const developerLabel = developerId === 'yan' ? 'YAN' : 'SERGEY';

  return (
    <main id="main" className={`developer-page developer-page--${developerId}`} aria-label="Страница разработчика">
      <section className="developer-placeholder" aria-labelledby="developer-placeholder-title">
        <div className="developer-placeholder__body">
          <div className="developer-placeholder__copy">
            <p className="developer-placeholder__eyebrow">[ ПРОФИЛЬ / {developerLabel} ]</p>
            <h1 id="developer-placeholder-title">Здесь пока ничего нет.</h1>
            <p className="developer-placeholder__description">
              Профиль уже собирается. Скоро здесь появится больше.
            </p>

            <div className="developer-placeholder__action">
              <button type="button" onClick={onReturnHome}>
                <span aria-hidden="true">←</span>
                <span>Вернуться в главное меню</span>
              </button>
            </div>
          </div>

          <figure className="developer-placeholder__media">
            <img src={catTypingGif} alt="Кот печатает на клавиатуре" />
          </figure>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(getKnownPathname);
  const [pendingSection, setPendingSection] = useState<HomeSection | null>(null);
  const [pendingHomeScrollY, setPendingHomeScrollY] = useState<number | null>(null);
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
    const syncRoute = (event: PopStateEvent) => {
      const nextPathname = getKnownPathname();

      if (nextPathname === '/') {
        setHasPlayedHeroIntro(true);
        setPendingSection(null);
        setPendingHomeScrollY(readHomeScrollY(event.state));
      }

      setPathname(nextPathname);
    };

    window.addEventListener('popstate', syncRoute);

    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useLayoutEffect(() => {
    if (isDeveloperPage) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (pendingHomeScrollY !== null) {
      let secondFrame = 0;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          window.scrollTo({ top: pendingHomeScrollY, left: 0, behavior: 'auto' });
          setPendingHomeScrollY(null);
        });
      });

      return () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }

    if (!pendingSection) return;

    if (pendingSection === 'top') {
      window.scrollTo({ top: 0, left: 0, behavior: getPreferredScrollBehavior() });
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
  }, [isDeveloperPage, pendingHomeScrollY, pendingSection]);

  const navigateHomeSection = useCallback((section: HomeSection) => {
    if (window.location.pathname !== '/') {
      setHasPlayedHeroIntro(true);
      window.history.pushState(null, '', '/');
      setPathname('/');
      setPendingHomeScrollY(null);
      setPendingSection(section);
      return;
    }

    setPendingSection(null);

    if (section === 'top') {
      window.scrollTo({ top: 0, left: 0, behavior: getPreferredScrollBehavior() });
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new CustomEvent('page-section-scroll', { detail: { id: 'top' } }));
      return;
    }

    scrollToPageSection(`#${section}`);
  }, []);

  const navigateDeveloper = useCallback((nextDeveloperId: DeveloperId) => {
    const nextPath = developerPaths[nextDeveloperId];
    const isLeavingHome = window.location.pathname === '/';

    if (isLeavingHome) {
      const homeScrollY = saveHomeScrollY();
      window.history.pushState({ homeScrollY, returnToHome: true } satisfies AppHistoryState, '', nextPath);
    } else if (window.location.pathname !== nextPath) {
      window.history.replaceState(getHistoryState(), '', nextPath);
    }

    setHasPlayedHeroIntro(true);
    setPendingSection(null);
    setPendingHomeScrollY(null);
    setPathname(nextPath);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const returnToHome = useCallback(() => {
    const historyState = getHistoryState();
    const homeScrollY = readHomeScrollY(historyState);

    setHasPlayedHeroIntro(true);
    setPendingSection(null);
    setPendingHomeScrollY(homeScrollY);

    if (historyState.returnToHome && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.history.replaceState({ homeScrollY } satisfies AppHistoryState, '', '/');
    setPathname('/');
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
        <DeveloperProfilePage developerId={developerId} onReturnHome={returnToHome} />
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
