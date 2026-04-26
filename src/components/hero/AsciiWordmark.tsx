import { brand } from '../../data/brand';

function renderLetters(value: string, side: 'left' | 'right') {
  return value.split('').map((letter, index) => (
    <span className={`wordmark-letter wordmark-letter--${side}`} data-final={letter} key={`${side}-${letter}-${index}`}>
      {letter}
    </span>
  ));
}

export default function AsciiWordmark() {
  return (
    <h1 className="ascii-wordmark">
      <span className="sr-only">{brand.name}</span>
      <span className="wordmark-visual" aria-hidden="true">
        <span className="wordmark-side wordmark-side--left">{renderLetters(brand.left, 'left')}</span>
        <span className="wordmark-cross">{brand.cross}</span>
        <span className="wordmark-side wordmark-side--right">{renderLetters(brand.right, 'right')}</span>
      </span>
    </h1>
  );
}
