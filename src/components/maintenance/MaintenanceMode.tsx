import { useEffect } from 'react';
import { brand } from '../../data/brand';

function Wordmark() {
  return (
    <p className="maintenance-wordmark" aria-label={brand.name}>
      <span>{brand.left}</span>
      <span aria-hidden="true">{brand.cross}</span>
      <span>{brand.right}</span>
    </p>
  );
}

export default function MaintenanceMode() {
  useEffect(() => {
    document.title = `${brand.name} — техническое обслуживание`;
  }, []);

  return (
    <main className="maintenance-page" aria-labelledby="maintenance-title">
      <div className="maintenance-page__grid" aria-hidden="true" />
      <section className="maintenance-panel" role="status" aria-live="polite">
        <p className="maintenance-panel__eyebrow">system / maintenance mode</p>
        <Wordmark />
        <h1 id="maintenance-title" aria-label="Сайт находится на техническом обслуживании">
          <span aria-hidden="true">Сайт</span>
          <span aria-hidden="true">находится</span>
          <span aria-hidden="true">на</span>
          <span aria-hidden="true">техническом</span>
          <span aria-hidden="true">обслуживании</span>
        </h1>
        <p className="maintenance-panel__copy">
          Извините за неудобства. Мы обновляем систему и скоро вернем сайт в работу.
        </p>
      </section>
    </main>
  );
}
