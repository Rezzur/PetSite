export default function ContactsSection() {
  return (
    <section aria-labelledby="contacts-title" className="contacts-section" id="contacts">
      <div className="contacts-grid">
        <div className="contacts-heading">
          <p className="section-label contacts-label">[ 03 / контакты ]</p>
          <h2 id="contacts-title">Связь</h2>
        </div>

        <article className="contact-telegram-card" aria-label="Telegram контакт скоро появится">
          <div className="telegram-metallic-mark" aria-hidden="true">
            <svg className="telegram-metallic-logo" viewBox="0 0 240 240">
              <defs>
                <linearGradient id="telegramChromeGradient" x1="-12%" x2="112%" y1="12%" y2="88%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="28%" stopColor="#dff8ff" />
                  <stop offset="52%" stopColor="#5fd2ff" />
                  <stop offset="74%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#9eeaff" />
                </linearGradient>
              </defs>

              <path
                className="telegram-metallic-logo__path"
                d="M220.6 38.7 186.4 199c-2.6 11.4-9.5 14.1-19.2 8.8l-52.1-38.4-25.2 24.2c-2.8 2.8-5.1 5.1-10.5 5.1l3.8-53.1 96.6-87.3c4.2-3.8-.9-5.9-6.5-2.1L53.8 131.4 2.4 115.3c-11.2-3.5-11.4-11.2 2.3-16.5L205.8 21.4c9.4-3.5 17.6 2.1 14.8 17.3Z"
                fill="url(#telegramChromeGradient)"
                stroke="rgba(190,244,255,0.72)"
                strokeWidth="1.4"
              />
            </svg>
          </div>

          <div className="contact-telegram-card__copy">
            <p className="contact-telegram-card__channel">Telegram</p>
            <p className="contact-telegram-card__placeholder">Здесь скоро появится контакт для связи</p>
          </div>
        </article>
      </div>
    </section>
  );
}
