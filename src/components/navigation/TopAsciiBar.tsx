import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { brand } from '../../data/brand';

type ActiveZone = 'top' | 'developers' | 'works' | 'contacts';
type DeveloperId = 'yan' | 'sergey';

type TopAsciiBarProps = {
  developerId?: DeveloperId;
  page: 'home' | 'developer';
  onNavigateDeveloper: (developerId: DeveloperId) => void;
  onNavigateHomeSection: (section: ActiveZone) => void;
};

const navItems: Array<{ id: ActiveZone; label: string }> = [
  { id: 'top', label: 'Главная' },
  { id: 'developers', label: 'Разработчики' },
  { id: 'works', label: 'Работы' },
  { id: 'contacts', label: 'Контакты' }
];

const developerItems: Array<{ id: DeveloperId; label: string }> = [
  { id: 'yan', label: 'Ян' },
  { id: 'sergey', label: 'Сергей' }
];

const developerDropdownGap = 8;

function BracketedLabel({ label }: { label: string }) {
  return (
    <>
      <span className="top-ascii-bar__bracket" aria-hidden="true">
        [
      </span>
      <span className="top-ascii-bar__label">{label}</span>
      <span className="top-ascii-bar__bracket" aria-hidden="true">
        ]
      </span>
    </>
  );
}

export default function TopAsciiBar({
  developerId,
  page,
  onNavigateDeveloper,
  onNavigateHomeSection
}: TopAsciiBarProps) {
  const [isHeroReady, setIsHeroReady] = useState(page === 'developer');
  const [activeZone, setActiveZone] = useState<ActiveZone>(page === 'developer' ? 'developers' : 'top');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDevelopersMenuOpen, setIsDevelopersMenuOpen] = useState(false);
  const [developersMenuBounds, setDevelopersMenuBounds] = useState<{ left: number; top: number; width: number } | null>(
    null
  );
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const developersButtonRef = useRef<HTMLButtonElement | null>(null);
  const developersCloseTimerRef = useRef<number | undefined>(undefined);
  const flashTimerRef = useRef<number | undefined>(undefined);
  const isReady = page === 'developer' || isHeroReady;

  const updateDevelopersMenuBounds = () => {
    const button = developersButtonRef.current;
    const rect = button?.getBoundingClientRect();
    const barRect = button?.closest('.top-ascii-bar')?.getBoundingClientRect();
    if (!rect || !barRect) return false;

    const nextBounds = {
      left: rect.left - barRect.left,
      top: rect.bottom - barRect.top + developerDropdownGap,
      width: rect.width
    };

    setDevelopersMenuBounds((previousBounds) => {
      if (
        previousBounds &&
        Math.abs(previousBounds.left - nextBounds.left) < 0.5 &&
        Math.abs(previousBounds.top - nextBounds.top) < 0.5 &&
        Math.abs(previousBounds.width - nextBounds.width) < 0.5
      ) {
        return previousBounds;
      }

      return nextBounds;
    });

    return true;
  };

  useLayoutEffect(() => {
    if (!isReady) return undefined;

    updateDevelopersMenuBounds();
    const frame = window.requestAnimationFrame(updateDevelopersMenuBounds);
    window.addEventListener('resize', updateDevelopersMenuBounds);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateDevelopersMenuBounds);
    };
  }, [isReady, page]);

  useEffect(() => {
    if (page === 'developer') {
      setIsHeroReady(true);
      setActiveZone('developers');
      setIsMenuOpen(false);
      return undefined;
    }

    const hero = document.querySelector<HTMLElement>('.hero-section');
    if (!hero) {
      setIsHeroReady(true);
      return undefined;
    }

    const syncReadyState = () => {
      setIsHeroReady(hero.classList.contains('is-ready'));
    };

    syncReadyState();

    const observer = new MutationObserver(syncReadyState);
    observer.observe(hero, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [page]);

  useEffect(() => {
    if (page !== 'home' || !isHeroReady) return undefined;

    let frame = 0;

    const updateActiveZone = () => {
      frame = 0;
      const developers = document.getElementById('developers');
      const works = document.getElementById('works');
      const contacts = document.getElementById('contacts');
      const threshold = 140;
      const contactsThreshold = Math.min(window.innerHeight * 0.62, 520);
      const pageBottomGap = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);

      if (contacts && pageBottomGap <= 8) {
        setActiveZone('contacts');
        return;
      }

      if (contacts && contacts.getBoundingClientRect().top <= contactsThreshold) {
        setActiveZone('contacts');
        return;
      }

      if (works && works.getBoundingClientRect().top <= threshold) {
        setActiveZone('works');
        return;
      }

      if (developers && developers.getBoundingClientRect().top <= threshold) {
        setActiveZone('developers');
        return;
      }

      setActiveZone('top');
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveZone);
    };

    const updateFromRequestedSection = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id === 'top' || id === 'developers' || id === 'works' || id === 'contacts') {
        setActiveZone(id);
      }
    };

    updateActiveZone();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('page-section-scroll', updateFromRequestedSection);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      window.removeEventListener('page-section-scroll', updateFromRequestedSection);
    };
  }, [isHeroReady, page]);

  useEffect(() => {
    if (!isReady) {
      setIsMenuOpen(false);
      setIsDevelopersMenuOpen(false);
    }
  }, [isReady]);

  useEffect(() => {
    if (!isMenuOpen && !isDevelopersMenuOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsDevelopersMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isDevelopersMenuOpen, isMenuOpen]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== undefined) window.clearTimeout(flashTimerRef.current);
      if (developersCloseTimerRef.current !== undefined) window.clearTimeout(developersCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isDevelopersMenuOpen) return undefined;

    let frame = 0;

    const trackDevelopersMenuBounds = () => {
      updateDevelopersMenuBounds();
      frame = window.requestAnimationFrame(trackDevelopersMenuBounds);
    };

    trackDevelopersMenuBounds();
    window.addEventListener('resize', updateDevelopersMenuBounds);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateDevelopersMenuBounds);
    };
  }, [isDevelopersMenuOpen]);

  const triggerFlash = (key: string) => {
    if (flashTimerRef.current !== undefined) window.clearTimeout(flashTimerRef.current);
    setFlashKey(key);
    flashTimerRef.current = window.setTimeout(() => setFlashKey(null), 430);
  };

  const openDevelopersMenu = () => {
    if (developersCloseTimerRef.current !== undefined) window.clearTimeout(developersCloseTimerRef.current);
    if (updateDevelopersMenuBounds()) {
      setIsDevelopersMenuOpen(true);
    }
  };

  const scheduleDevelopersMenuClose = () => {
    if (developersCloseTimerRef.current !== undefined) window.clearTimeout(developersCloseTimerRef.current);
    developersCloseTimerRef.current = window.setTimeout(() => setIsDevelopersMenuOpen(false), 120);
  };

  const goTo = (target: ActiveZone) => {
    setIsMenuOpen(false);
    setIsDevelopersMenuOpen(false);
    triggerFlash(`section-${target}`);
    onNavigateHomeSection(target);
  };

  const goBrandHome = () => {
    setIsMenuOpen(false);
    setIsDevelopersMenuOpen(false);
    triggerFlash('brand-home');
    onNavigateHomeSection('top');
  };

  const goDeveloper = (nextDeveloperId: DeveloperId) => {
    setIsMenuOpen(false);
    setIsDevelopersMenuOpen(false);
    triggerFlash(`developer-${nextDeveloperId}`);
    onNavigateDeveloper(nextDeveloperId);
  };

  return (
    <header
      aria-hidden={isReady ? undefined : true}
      className="top-ascii-bar"
      data-page={page}
      data-ready={isReady ? 'true' : 'false'}
    >
      <div className="top-ascii-bar__inner">
        <button
          className={`top-ascii-bar__brand ${flashKey === 'brand-home' ? 'is-flashing' : ''}`.trim()}
          data-brand-target
          disabled={!isReady}
          tabIndex={isReady ? undefined : -1}
          type="button"
          onClick={goBrandHome}
        >
          {brand.name}
        </button>

        <nav className="top-ascii-bar__nav" aria-disabled={!isReady} aria-label="Основная навигация" data-nav-chrome>
          {navItems.map((item) => {
            const isDevelopersItem = item.id === 'developers';
            const itemKey = `section-${item.id}`;
            const className = `top-ascii-bar__pill ${flashKey === itemKey ? 'is-flashing' : ''}`.trim();

            if (!isDevelopersItem) {
              return (
                <button
                  aria-current={activeZone === item.id ? 'page' : undefined}
                  className={className}
                  data-nav-id={item.id}
                  disabled={!isReady}
                  key={item.id}
                  type="button"
                  onClick={() => goTo(item.id)}
                >
                  <BracketedLabel label={item.label} />
                </button>
              );
            }

            return (
              <div
                className="top-ascii-bar__nav-group"
                key={item.id}
                onBlur={scheduleDevelopersMenuClose}
                onFocus={openDevelopersMenu}
                onMouseEnter={openDevelopersMenu}
                onMouseLeave={scheduleDevelopersMenuClose}
              >
                <button
                  aria-current={activeZone === item.id ? 'page' : undefined}
                  aria-expanded={isDevelopersMenuOpen}
                  aria-haspopup="menu"
                  className={`${className} top-ascii-bar__pill--with-menu`}
                  data-nav-id={item.id}
                  disabled={!isReady}
                  ref={developersButtonRef}
                  type="button"
                  onClick={() => goTo(item.id)}
                >
                  <BracketedLabel label={item.label} />
                  <span className="top-ascii-bar__chevron" aria-hidden="true">
                    {isDevelopersMenuOpen ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                  </span>
                </button>

                <span className="top-ascii-bar__dropdown-bridge" aria-hidden="true" />
              </div>
            );
          })}
        </nav>

        <button
          aria-controls="top-ascii-menu"
          aria-expanded={isMenuOpen}
          className="top-ascii-bar__menu-button"
          disabled={!isReady}
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <BracketedLabel label="menu" />
        </button>
      </div>

      <div className="top-ascii-bar__mobile-menu" data-nav-chrome hidden={!isMenuOpen} id="top-ascii-menu">
        {navItems.map((item) => (
          <div className="top-ascii-bar__mobile-group" key={item.id}>
            <button
              aria-current={activeZone === item.id ? 'page' : undefined}
              className={`top-ascii-bar__mobile-item ${flashKey === `section-${item.id}` ? 'is-flashing' : ''}`.trim()}
              disabled={!isReady}
              type="button"
              onClick={() => goTo(item.id)}
            >
              <BracketedLabel label={item.label} />
              {item.id === 'developers' ? (
                <span className="top-ascii-bar__chevron" aria-hidden="true">
                  <ChevronDown size={14} strokeWidth={2} />
                </span>
              ) : null}
            </button>

            {item.id === 'developers' ? (
              <div className="top-ascii-bar__mobile-submenu" aria-label="Страницы разработчиков">
                {developerItems.map((developer) => (
                  <button
                    aria-current={developerId === developer.id ? 'page' : undefined}
                    className={`top-ascii-bar__mobile-subitem ${
                      flashKey === `developer-${developer.id}` ? 'is-flashing' : ''
                    }`.trim()}
                    disabled={!isReady}
                    key={developer.id}
                    type="button"
                    onClick={() => goDeveloper(developer.id)}
                  >
                    <BracketedLabel label={developer.label} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div
        aria-hidden={!isDevelopersMenuOpen}
        className="top-ascii-bar__dropdown"
        data-open={isDevelopersMenuOpen ? 'true' : 'false'}
        role="menu"
        style={
          developersMenuBounds
            ? {
                width: `${developersMenuBounds.width}px`,
                left: `${developersMenuBounds.left}px`,
                top: `${developersMenuBounds.top}px`
              }
            : undefined
        }
        onBlur={scheduleDevelopersMenuClose}
        onFocus={openDevelopersMenu}
        onMouseEnter={openDevelopersMenu}
        onMouseLeave={scheduleDevelopersMenuClose}
      >
        {developerItems.map((developer) => (
          <button
            aria-current={developerId === developer.id ? 'page' : undefined}
            className={`top-ascii-bar__dropdown-item ${
              flashKey === `developer-${developer.id}` ? 'is-flashing' : ''
            }`.trim()}
            disabled={!isReady}
            key={developer.id}
            role="menuitem"
            type="button"
            onClick={() => goDeveloper(developer.id)}
          >
            <BracketedLabel label={developer.label} />
          </button>
        ))}
      </div>
    </header>
  );
}
