import { type MouseEvent } from 'react';
import { MagneticSurface } from '../interaction/MagneticSurface';
import ClickSpark from './ClickSpark';
import { scrollToPageSection } from '../../utils/scroll';

type PixelTransitionButtonProps = {
  href: string;
  children: string;
  variant?: 'primary' | 'secondary';
};

export default function PixelTransitionButton({ href, children, variant = 'primary' }: PixelTransitionButtonProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return;

    event.preventDefault();
    scrollToPageSection(href, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  };

  return (
    <MagneticSurface className="button-magnetic" magneticRadius={130} magneticStrength={11}>
      <ClickSpark>
        <a className={`pixel-button pixel-button--${variant}`} href={href} onClick={handleClick}>
          <span className="pixel-button__grid" aria-hidden="true" />
          <span className="pixel-button__stars" aria-hidden="true" />
          <span className="pixel-button__label">
            {children}
            {variant === 'secondary' ? (
              <span className="pixel-button__arrow" aria-hidden="true">
                {' '}
                -&gt;
              </span>
            ) : null}
          </span>
        </a>
      </ClickSpark>
    </MagneticSurface>
  );
}
