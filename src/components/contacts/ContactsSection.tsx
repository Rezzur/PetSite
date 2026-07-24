import { ArrowRight, Mail, Maximize2, Minus, Send, X } from 'lucide-react';
import { brand } from '../../data/brand';
import ClickSpark from '../hero/ClickSpark';
import { MagneticSurface } from '../interaction/MagneticSurface';

const email = 'studio@smirnov-zyryanov.ru';
const telegramHref = 'https://t.me/smirnov_zyryanov';

export default function ContactsSection() {
  return (
    <section aria-labelledby="contacts-title" className="contacts-section" id="contacts">
      <div className="contacts-shell">
        <div className="contacts-grid">
          <div className="contacts-heading">
            <p className="section-label contacts-label">[ 03 / КОНТАКТЫ ]</p>
            <h2 id="contacts-title">Обсудим ваш проект?</h2>
            <MagneticSurface className="contacts-write-magnetic button-magnetic" magneticRadius={130} magneticStrength={11}>
              <ClickSpark>
                <a className="contacts-write-button pixel-button pixel-button--contact" href={`mailto:${email}`}>
                  <span className="pixel-button__grid" aria-hidden="true" />
                  <span className="pixel-button__stars" aria-hidden="true" />
                  <span className="pixel-button__label contacts-write-button__label">
                    <span>Написать нам</span>
                    <ArrowRight aria-hidden="true" size={21} strokeWidth={1.7} />
                  </span>
                </a>
              </ClickSpark>
            </MagneticSurface>
          </div>

          <div className="contacts-console-area">
            <p className="contacts-intro">
              Расскажите о задаче — предложим подход и соберём решение, которое работает.
            </p>

            <div className="contacts-direct-actions" aria-label="Быстрые контакты">
              <a href={telegramHref} rel="noreferrer" target="_blank">
                <Send aria-hidden="true" size={17} strokeWidth={1.8} />
                <span>Telegram</span>
              </a>
              <a href={`mailto:${email}`}>
                <Mail aria-hidden="true" size={17} strokeWidth={1.8} />
                <span>Email</span>
              </a>
            </div>

            <article className="contacts-terminal" aria-label="Контактный терминал">
              <div className="contacts-terminal__actions" aria-hidden="true">
                <Minus size={13} strokeWidth={1.6} />
                <Maximize2 size={12} strokeWidth={1.5} />
                <X size={13} strokeWidth={1.6} />
              </div>
              <div className="contacts-terminal__lines">
                <p>
                  <span>$</span>
                  <span>connect {email}</span>
                </p>
                <p>
                  <span>&gt;</span>
                  <span>establishing connection...</span>
                </p>
                <p>
                  <span>&gt;</span>
                  <span>connection successful</span>
                </p>
                <p>
                  <span>&gt;</span>
                  <span>
                    awaiting your message...
                    <i aria-hidden="true" />
                  </span>
                </p>
              </div>
            </article>
          </div>
        </div>

      </div>

      <footer className="contacts-footer">
        <div className="contacts-footer__brand">
          <strong>{brand.name}</strong>
          <span>ASCII DIGITAL STUDIO</span>
        </div>

        <p className="contacts-footer__copyright">© 2026 Все права защищены.</p>

        <nav className="contacts-footer__links" aria-label="Контакты">
          <a href={telegramHref} rel="noreferrer" target="_blank">
            TG
          </a>
          <span aria-hidden="true">/</span>
          <a href={`mailto:${email}`}>EMAIL</a>
        </nav>
      </footer>
    </section>
  );
}
