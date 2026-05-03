import { useEffect, useState } from 'react';
import { brand } from '../../data/brand';
import { scrollToPageSection } from '../../utils/scroll';

type ActiveZone = 'top' | 'about' | 'works' | 'contacts';

const navItems: Array<{ id: ActiveZone; label: string; target?: string; disabled?: boolean }> = [
  { id: 'top', label: '00 / top', target: 'top' },
  { id: 'about', label: '01 / about', target: 'about' },
  { id: 'works', label: '02 / works', target: 'works' },
  { id: 'contacts', label: '03 / contacts', target: 'contacts' }
];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function TopAsciiBar() {
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [activeZone, setActiveZone] = useState<ActiveZone>('top');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.hero-section');
    if (!hero) return undefined;

    const syncReadyState = () => {
      setIsHeroReady(hero.classList.contains('is-ready'));
    };

    syncReadyState();

    const observer = new MutationObserver(syncReadyState);
    observer.observe(hero, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHeroReady) return undefined;

    let frame = 0;

    const updateActiveZone = () => {
      frame = 0;
      const about = document.getElementById('about');
      const works = document.getElementById('works');
      const contacts = document.getElementById('contacts');
      const threshold = 140;

      if (contacts && contacts.getBoundingClientRect().top <= threshold) {
        setActiveZone('contacts');
        return;
      }

      if (works && works.getBoundingClientRect().top <= threshold) {
        setActiveZone('works');
        return;
      }

      if (about && about.getBoundingClientRect().top <= threshold) {
        setActiveZone('about');
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
      if (id === 'top' || id === 'about' || id === 'works' || id === 'contacts') {
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
  }, [isHeroReady]);

  useEffect(() => {
    if (!isHeroReady) setIsMenuOpen(false);
  }, [isHeroReady]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    window.dispatchEvent(new CustomEvent('page-section-scroll', { detail: { id: 'top' } }));
  };

  const goTo = (target?: string) => {
    if (!target) return;
    setIsMenuOpen(false);

    if (target === 'top') {
      scrollToTop();
      return;
    }

    scrollToPageSection(`#${target}`, prefersReducedMotion() ? 'auto' : 'smooth');
  };

  return (
    <header aria-hidden={isHeroReady ? undefined : true} className="top-ascii-bar" data-ready={isHeroReady ? 'true' : 'false'}>
      <div className="top-ascii-bar__inner">
        <button
          className="top-ascii-bar__brand"
          data-brand-target
          disabled={!isHeroReady}
          tabIndex={isHeroReady ? undefined : -1}
          type="button"
          onClick={scrollToTop}
        >
          {brand.name}
        </button>

        <nav className="top-ascii-bar__nav" aria-disabled={!isHeroReady} aria-label="Основная навигация" data-nav-chrome>
          {navItems.map((item) => (
            <button
              aria-current={activeZone === item.id ? 'page' : undefined}
              className="top-ascii-bar__pill"
              disabled={!isHeroReady || item.disabled}
              key={item.id}
              type="button"
              onClick={() => goTo(item.target)}
            >
              [ {item.label} ]
            </button>
          ))}
        </nav>

        <div className="top-ascii-bar__actions" aria-disabled={!isHeroReady} data-nav-chrome>
          <span className="top-ascii-bar__status" aria-label="Статус онлайн">
            [ {isHeroReady ? 'ONLINE' : 'BOOT'} ]
          </span>
          <button className="top-ascii-bar__cta" disabled={!isHeroReady} type="button" onClick={() => goTo('contacts')}>
            [ Обсудить ]
          </button>
        </div>

        <button
          aria-controls="top-ascii-menu"
          aria-expanded={isMenuOpen}
          className="top-ascii-bar__menu-button"
          disabled={!isHeroReady}
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          [ menu ]
        </button>
      </div>

      <div className="top-ascii-bar__mobile-menu" data-nav-chrome hidden={!isMenuOpen} id="top-ascii-menu">
        {navItems.map((item) => (
          <button
            aria-current={activeZone === item.id ? 'page' : undefined}
            className="top-ascii-bar__mobile-item"
            disabled={!isHeroReady || item.disabled}
            key={item.id}
            type="button"
            onClick={() => goTo(item.target)}
          >
            [ {item.label} ]
          </button>
        ))}
        <button
          className="top-ascii-bar__mobile-item top-ascii-bar__mobile-item--cta"
          disabled={!isHeroReady}
          type="button"
          onClick={() => goTo('contacts')}
        >
          [ Обсудить ]
        </button>
      </div>
    </header>
  );
}
