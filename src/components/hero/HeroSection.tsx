import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePointer } from '../../hooks/usePointer';
import AsciiWordmark from './AsciiWordmark';
import CRTStage from './CRTStage';
import PixelBurstFromCross from './PixelBurstFromCross';
import PixelTransitionButton from './PixelTransitionButton';
import ReactiveAsciiBackground from './ReactiveAsciiBackground';
import ShapeGrid from './ShapeGrid';
import TextType from './TextType';

gsap.registerPlugin(useGSAP);

const heroTypePhrases = [
  'Мы создаем сайты. 🌐',
  'Мы делаем приложения. 📱',
  'Мы проектируем интерфейсы. 🖥️',
  'Мы создаем цифровой дизайн. ✨',
  'Мы собираем понятные продукты. 🚀'
];

const scrollLockKeys = new Set([' ', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp']);

function lockInitialScroll() {
  const html = document.documentElement;
  const body = document.body;
  const lockedY = window.scrollY;
  let frame = 0;

  const preventScroll = (event: Event) => {
    event.preventDefault();
  };

  const preventScrollKey = (event: KeyboardEvent) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const editableTarget = target?.closest('input, textarea, select, [contenteditable="true"]');

    if (editableTarget || event.altKey || event.ctrlKey || event.metaKey || !scrollLockKeys.has(event.key)) return;

    event.preventDefault();
  };

  const keepLockedPosition = () => {
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (window.scrollY !== lockedY) window.scrollTo({ top: lockedY, left: 0, behavior: 'auto' });
    });
  };

  html.classList.add('is-hero-scroll-locked');
  body.classList.add('is-hero-scroll-locked');
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('keydown', preventScrollKey);
  window.addEventListener('scroll', keepLockedPosition, { passive: true });

  return () => {
    html.classList.remove('is-hero-scroll-locked');
    body.classList.remove('is-hero-scroll-locked');
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    window.removeEventListener('keydown', preventScrollKey);
    window.removeEventListener('scroll', keepLockedPosition);
    if (frame) window.cancelAnimationFrame(frame);
  };
}

export default function HeroSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [isHeroTextActive, setIsHeroTextActive] = useState(false);
  const [showWordmarkBurst, setShowWordmarkBurst] = useState(true);
  const { reducedMotion } = usePointer();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frame = 0;
    const updateExitFade = () => {
      frame = 0;
      const viewport = window.innerHeight || 1;
      const start = viewport * 0.08;
      const end = viewport * 0.38;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));

      root.style.setProperty('--hero-exit', progress.toFixed(3));
      root.classList.toggle('is-exiting', progress > 0.04);
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateExitFade);
    };

    updateExitFade();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      root.style.removeProperty('--hero-exit');
      root.classList.remove('is-exiting');
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const letters = gsap.utils.toArray<HTMLElement>('.wordmark-letter', root);
      const mobile = window.matchMedia('(max-width: 640px)').matches;
      const timing = mobile
        ? {
            terminal: 0.22,
            boot: 0.42,
            progress: 0.72,
            progressEnd: 3.68,
            commands: 1.06,
            post: 3.88,
            cross: 4.4,
            letters: 4.72,
            stabilize: 5.16,
            layout: 5.56,
            end: 6.08
          }
        : {
            terminal: 0.35,
            boot: 0.88,
            progress: 1.1,
            progressEnd: 4.86,
            commands: 2.02,
            post: 5.08,
            cross: 5.86,
            letters: 6.28,
            stabilize: 6.88,
            layout: 7.32,
            end: 8.08
          };
      const identity = root.querySelector<HTMLElement>('.hero-identity');
      const copy = root.querySelector<HTMLElement>('.hero-copy');
      const introTerminal = root.querySelector<HTMLElement>('.hero-terminal-intro');
      const introCommand = root.querySelector<HTMLElement>('[data-terminal-command="boot"]');
      const introCursor = root.querySelector<HTMLElement>('.terminal-cursor');
      const commandLines = gsap.utils.toArray<HTMLElement>('.terminal-line--command', root);
      const postLines = gsap.utils.toArray<HTMLElement>('.terminal-line--post', root);
      const terminalTexts = gsap.utils.toArray<HTMLElement>('.terminal-text', root);
      const terminalStatuses = gsap.utils.toArray<HTMLElement>('.terminal-status', root);
      const terminalProgress = root.querySelector<HTMLElement>('.terminal-progress-line');
      const terminalProgressFill = root.querySelector<HTMLElement>('.terminal-progress-fill');
      const terminalProgressValue = root.querySelector<HTMLElement>('.terminal-progress-value');
      let releaseInitialScroll: (() => void) | undefined;

      const getIntroTransform = () => {
        if (!identity || mobile) return { x: 0, y: 0, scale: 1 };

        const rootRect = root.getBoundingClientRect();
        const identityRect = identity.getBoundingClientRect();
        const wordmarkRect = root.querySelector<HTMLElement>('.wordmark-visual')?.getBoundingClientRect();
        const rootCenterX = rootRect.left + rootRect.width / 2;
        const rootCenterY = rootRect.top + rootRect.height * 0.48;
        const identityCenterX = identityRect.left + identityRect.width / 2;
        const identityCenterY = identityRect.top + identityRect.height / 2;
        const wordmarkWidth = wordmarkRect?.width || identityRect.width;
        const maxReadableScale = Math.max(1.35, Math.min(1.72, (rootRect.width - 96) / Math.max(wordmarkWidth, 1)));

        return {
          x: rootCenterX - identityCenterX,
          y: rootCenterY - identityCenterY,
          scale: maxReadableScale
        };
      };

      const finalizeHero = () => {
        releaseInitialScroll?.();
        releaseInitialScroll = undefined;
        root.classList.remove('is-intro');
        root.classList.add('is-ready');
        setIsHeroTextActive(true);
        setShowWordmarkBurst(false);
        letters.forEach((letter) => {
          letter.textContent = letter.dataset.final ?? letter.textContent;
          letter.style.opacity = '1';
        });
        gsap.set(identity, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: 'filter' });
        gsap.set(copy, { autoAlpha: 1, x: 0, y: 0 });
        gsap.set(introTerminal, { autoAlpha: 0 });
        gsap.set(root.querySelectorAll('.hero-entrance'), { opacity: 1, y: 0, x: 0 });
        gsap.set(root.querySelectorAll('.wordmark-letter, .wordmark-cross'), { opacity: 1, scale: 1, x: 0, y: 0 });
        gsap.set(root.querySelectorAll('.burst-particle'), { opacity: 0, x: 0, y: 0, scale: 1 });
        gsap.set(root.querySelector('.pixel-burst'), { autoAlpha: 0 });
        gsap.set(root.querySelector('.reactive-ascii-background'), { opacity: 0.52 });
        gsap.set(root.querySelector('.shape-grid-background'), { opacity: 0.34 });
        gsap.set(root.querySelector('.crt-stage-shell'), { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(root.querySelector('.crt-power-line'), { opacity: 0, scaleX: 1 });
        gsap.set(root.querySelector('.wordmark-visual'), { x: 0, filter: 'blur(0px)' });
        gsap.set(terminalProgressFill, { scaleX: 1 });
        if (terminalProgressValue) terminalProgressValue.textContent = '100%';
      };

      if (reducedMotion) {
        finalizeHero();
        return undefined;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' }
      });
      const introTransform = getIntroTransform();
      releaseInitialScroll = lockInitialScroll();

      root.classList.add('is-intro');
      root.classList.remove('is-ready');
      setIsHeroTextActive(false);
      setShowWordmarkBurst(true);
      gsap.set(root.querySelectorAll('.hero-entrance'), { opacity: 0, y: 12 });
      gsap.set(identity, {
        autoAlpha: 0,
        x: introTransform.x,
        y: introTransform.y,
        scale: introTransform.scale,
        transformOrigin: 'center center'
      });
      gsap.set(copy, { autoAlpha: 0, x: mobile ? 0 : 24, y: mobile ? 14 : 0 });
      gsap.set(introTerminal, { autoAlpha: 0, y: 4 });
      gsap.set(terminalTexts, { textContent: '' });
      gsap.set(terminalStatuses, { autoAlpha: 0 });
      gsap.set(commandLines, { autoAlpha: 0, y: 4 });
      gsap.set(postLines, { autoAlpha: 0, y: 4 });
      gsap.set(terminalProgress, { autoAlpha: 0, y: 4 });
      gsap.set(terminalProgressFill, { scaleX: 0 });
      if (terminalProgressValue) terminalProgressValue.textContent = '000%';
      gsap.set(introCursor, { opacity: 1 });
      gsap.set(root.querySelectorAll('.wordmark-letter'), { opacity: 0 });
      gsap.set(root.querySelector('.wordmark-cross'), { opacity: 0, scale: 0.6 });
      gsap.set(root.querySelector('.pixel-burst'), { autoAlpha: 1 });
      gsap.set(root.querySelector('.shape-grid-background'), { opacity: 0 });
      gsap.set(root.querySelector('.reactive-ascii-background'), { opacity: 0 });
      gsap.set(root.querySelector('.crt-stage-shell'), { clipPath: 'inset(50% 0% 50% 0%)' });
      gsap.set(root.querySelector('.crt-power-line'), { opacity: 0, scaleX: 0 });
      const fallbackTimer = window.setTimeout(finalizeHero, (timing.end + 0.45) * 1000);

      type TypingProfile = {
        base: number;
        variance: number;
        punctuation: number;
        space: number;
      };

      const humanDelay = (text: string, index: number, profile: TypingProfile) => {
        const char = text[index] ?? '';
        const next = text[index + 1] ?? '';
        const jitterSeed = (index * 17 + text.length * 11) % 9;
        const jitter = (jitterSeed / 8) * profile.variance;
        const punctuationPause = /[./\\[\]-]/.test(char) ? profile.punctuation : 0;
        const spacePause = char === ' ' || next === ' ' ? profile.space : 0;

        return profile.base + jitter + punctuationPause + spacePause;
      };

      const typeText = (
        element: HTMLElement | null | undefined,
        text: string,
        start: number,
        profile: TypingProfile
      ) => {
        if (!element) return start;
        let cursor = start;

        tl.call(
          () => {
            element.textContent = '';
          },
          [],
          start
        );

        for (let index = 0; index < text.length; index += 1) {
          cursor += humanDelay(text, index, profile);
          tl.call(
            () => {
              element.textContent = text.slice(0, index + 1);
            },
            [],
            cursor
          );
        }

        return cursor;
      };

      const commandTexts = ['load identity.sx', 'compile pair', 'render hero --mono'];
      const commandStatusTexts = ['[ OK ]', '[ RUN ]', '[ .. ]'];
      const postTexts = ['identity compose', 'interface sync', 'next modules pending'];
      const profiles = mobile
        ? {
            boot: { base: 0.018, variance: 0.012, punctuation: 0.018, space: 0.01 },
            commandFast: { base: 0.014, variance: 0.009, punctuation: 0.018, space: 0.008 },
            commandMedium: { base: 0.019, variance: 0.013, punctuation: 0.02, space: 0.012 }
          }
        : {
            boot: { base: 0.034, variance: 0.02, punctuation: 0.04, space: 0.018 },
            commandFast: { base: 0.024, variance: 0.015, punctuation: 0.032, space: 0.014 },
            commandMedium: { base: 0.032, variance: 0.019, punctuation: 0.04, space: 0.02 }
          };
      const commandProfiles = [profiles.commandMedium, profiles.commandFast];
      const progressState = { value: 0 };
      const progressDuration = Math.max(0.1, timing.progressEnd - timing.progress);

      tl.to(introTerminal, { autoAlpha: 1, y: 0, duration: 0.18 }, timing.terminal);
      typeText(introCommand, 'boot --mode ascii', timing.boot, profiles.boot);
      tl.to(terminalProgress, { autoAlpha: 1, y: 0, duration: 0.18 }, timing.progress - 0.08)
        .to(
          terminalProgressFill,
          { scaleX: 1, duration: progressDuration, ease: 'power1.inOut' },
          timing.progress
        )
        .to(
          progressState,
          {
            value: 100,
            duration: progressDuration,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (!terminalProgressValue) return;
              terminalProgressValue.textContent = `${Math.round(progressState.value).toString().padStart(3, '0')}%`;
            },
            onComplete: () => {
              if (terminalProgressValue) terminalProgressValue.textContent = '100%';
            }
          },
          timing.progress
        );

      commandLines.forEach((line, index) => {
        const text = line.querySelector<HTMLElement>('.terminal-text');
        const status = line.querySelector<HTMLElement>('.terminal-status');
        const lineStart = timing.commands + index * (mobile ? 0.42 : 0.58);
        const textEnd = typeText(text, commandTexts[index] ?? '', lineStart + 0.06, commandProfiles[index] ?? profiles.commandMedium);

        tl.to(line, { autoAlpha: 1, y: 0, duration: 0.12 }, lineStart);
        tl.call(
          () => {
            if (status) status.textContent = commandStatusTexts[index] ?? '[OK]';
          },
          [],
          textEnd + (mobile ? 0.06 : 0.1)
        ).to(status, { autoAlpha: 1, duration: 0.08 }, textEnd + (mobile ? 0.07 : 0.11));
      });

      postLines.forEach((line, index) => {
        const text = line.querySelector<HTMLElement>('.terminal-text');
        const lineStart = timing.post + index * (mobile ? 0.18 : 0.24);
        tl.to(line, { autoAlpha: 1, y: 0, duration: 0.12 }, lineStart);
        typeText(text, postTexts[index] ?? '', lineStart + 0.04, profiles.commandFast);
      });

      tl.to(root.querySelector('.crt-stage-shell'), { clipPath: 'inset(0% 0% 0% 0%)', duration: mobile ? 0.44 : 0.56, ease: 'expo.out' }, 0.18)
        .to(introTerminal, { autoAlpha: 0, y: mobile ? -6 : -10, duration: mobile ? 0.26 : 0.36 }, timing.cross - (mobile ? 0.32 : 0.48))
        .to(identity, { autoAlpha: 1, duration: 0.08 }, timing.cross - 0.04)
        .to(root.querySelector('.wordmark-cross'), { opacity: 1, scale: 1, duration: mobile ? 0.28 : 0.36, ease: 'back.out(1.45)' }, timing.cross)
        .fromTo(
          root.querySelectorAll('.burst-particle'),
          { opacity: 0, x: 0, y: 0, scale: 0.5 },
          {
            opacity: 1,
            scale: 1,
            x: (index: number) => Math.cos((index / 22) * Math.PI * 2) * (mobile ? 28 : 42),
            y: (index: number) => Math.sin((index / 22) * Math.PI * 2) * (mobile ? 28 : 42),
            duration: mobile ? 0.3 : 0.42,
            stagger: 0.008,
            ease: 'power3.out'
          },
          timing.cross + 0.03
        )
        .to(root.querySelectorAll('.burst-particle'), { opacity: 0, duration: 0.16 }, timing.cross + (mobile ? 0.34 : 0.45))
        .call(() => setShowWordmarkBurst(false), [], timing.cross + (mobile ? 0.58 : 0.68));

      const letterOrder = letters
        .map((letter, index) => ({ letter, index, distance: Math.abs(index - (letters.length - 1) / 2) }))
        .sort((a, b) => a.distance - b.distance || (a.index % 2 === 0 ? -1 : 1));

      letterOrder.forEach(({ letter, index }, orderIndex) => {
        const final = letter.dataset.final ?? '';
        const start = timing.letters + orderIndex * (mobile ? 0.024 : 0.048);

        tl.call(
          () => {
            letter.textContent = final;
            letter.style.opacity = '0';
            letter.style.filter = 'blur(0.8px)';
          },
          [],
          start
        ).to(letter, { opacity: 1, filter: 'blur(0px)', duration: mobile ? 0.12 : 0.18, ease: 'power2.out' }, start);
      });

      tl.call(
        () => {
          letters.forEach((letter) => {
            letter.textContent = letter.dataset.final ?? letter.textContent;
            letter.style.opacity = '1';
            letter.style.filter = 'blur(0px)';
          });
        },
        [],
        timing.stabilize - 0.1
      );

      tl.to(root.querySelector('.wordmark-visual'), { x: -3, filter: 'blur(1px)', duration: 0.035 }, timing.stabilize)
        .to(root.querySelector('.wordmark-visual'), { x: 5, filter: 'blur(0px)', duration: 0.045 }, timing.stabilize + 0.052)
        .to(root.querySelector('.wordmark-visual'), { x: 0, duration: 0.04 }, timing.stabilize + 0.108);

      tl.to(root.querySelector('.shape-grid-background'), { opacity: 0.34, duration: 0.52 }, timing.layout - 0.2)
        .to(root.querySelector('.reactive-ascii-background'), { opacity: 0.52, duration: 0.52 }, timing.layout - 0.18)
        .to(introTerminal, { autoAlpha: 0, y: mobile ? -6 : -10, duration: 0.24 }, timing.layout - 0.08)
        .to(identity, { x: 0, y: 0, scale: 1, duration: mobile ? 0.42 : 0.74, ease: 'expo.out' }, timing.layout)
        .to(root.querySelector('.hero-eyebrow'), { opacity: 1, y: 0, duration: mobile ? 0.36 : 0.48 }, timing.layout + 0.08)
        .call(() => setIsHeroTextActive(true), [], timing.layout + 0.14)
        .to(copy, { autoAlpha: 1, x: 0, y: 0, duration: mobile ? 0.44 : 0.58, ease: 'power3.out' }, timing.layout + 0.18)
        .to(root.querySelectorAll('.hero-copy .hero-entrance'), { opacity: 1, y: 0, stagger: mobile ? 0.09 : 0.12, duration: mobile ? 0.42 : 0.52 }, timing.layout + 0.22)
        .call(finalizeHero, [], timing.end);

      return () => {
        window.clearTimeout(fallbackTimer);
        releaseInitialScroll?.();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <section className="hero-section is-intro" id="top" ref={rootRef}>
      <CRTStage>
        <ShapeGrid
          borderColor="rgba(255,255,255,0.11)"
          className="shape-grid-background"
          direction="diagonal"
          hoverFillColor="rgba(255,255,255,0.14)"
          hoverTrailAmount={3}
          shape="square"
          speed={0.14}
          squareSize={42}
        />
        <ReactiveAsciiBackground />

        <div className="hero-content">
          <div className="hero-identity">
            <p className="hero-eyebrow hero-entrance">ASCII DIGITAL STUDIO</p>
            <div className="wordmark-stack">
              <AsciiWordmark />
              <PixelBurstFromCross active={showWordmarkBurst} />
            </div>
          </div>
          <div className="hero-copy">
            <TextType
              aria-live="polite"
              as="p"
              className="hero-subtitle hero-entrance"
              cursorCharacter="▎"
              cursorClassName="hero-subtitle__cursor"
              deletingSpeed={24}
              disabled={reducedMotion || !isHeroTextActive}
              hideCursorWhileTyping={false}
              initialDelay={120}
              pauseDuration={1450}
              text={heroTypePhrases}
              typingSpeed={42}
              variableSpeed={{ min: 28, max: 72 }}
              variableSpeedEnabled
            />
            <div className="hero-actions hero-entrance">
              <PixelTransitionButton href="#about">Обсудить проект</PixelTransitionButton>
            </div>
          </div>
        </div>

        <div className="hero-terminal-intro" aria-hidden="true">
          <p className="terminal-prompt">
            <span>&gt; </span>
            <span data-terminal-command="boot" />
            <span className="terminal-cursor">_</span>
          </p>
          <p className="terminal-line terminal-line--command">
            <span>&gt; </span>
            <span className="terminal-text" />
            <span className="terminal-status" />
          </p>
          <p className="terminal-line terminal-line--command">
            <span>&gt; </span>
            <span className="terminal-text" />
            <span className="terminal-status" />
          </p>
          <p className="terminal-line terminal-line--command">
            <span>&gt; </span>
            <span className="terminal-text" />
            <span className="terminal-status" />
          </p>
          <p className="terminal-progress-line">
            <span>&gt; progress</span>
            <span className="terminal-progress-track">
              <span className="terminal-progress-fill" />
            </span>
            <span className="terminal-progress-value">000%</span>
          </p>
          <p className="terminal-line terminal-line--post">
            <span>&gt; </span>
            <span className="terminal-text" />
          </p>
          <p className="terminal-line terminal-line--post">
            <span>&gt; </span>
            <span className="terminal-text" />
          </p>
          <p className="terminal-line terminal-line--post">
            <span>[ </span>
            <span className="terminal-text" />
            <span> ]</span>
          </p>
        </div>

      </CRTStage>
    </section>
  );
}
