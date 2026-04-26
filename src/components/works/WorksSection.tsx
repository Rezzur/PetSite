import { workCards } from '../../data/content';

export default function WorksSection() {
  return (
    <section aria-labelledby="works-title" className="works-section" id="works">
      <div className="works-grid">
        <div className="about-copy works-intro">
          <p className="section-label">[ 02 / работы ]</p>
          <h2 id="works-title">ASCII works</h2>
          <p>Три направления, где SMIRNOV × ZYRYANOV соединяют инженерную сборку, интерфейс и визуальную систему.</p>
        </div>

        <div className="team-cards works-cards">
          {workCards.map((card, index) => (
            <article className="team-card team-card--ascii works-card" key={card.id}>
              <span className="team-card__punch" aria-hidden="true" />
              <div className="team-card__ascii works-card__ascii" aria-hidden="true">
                <span className="team-card__initials">0{index + 1}</span>
                {card.ascii.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              <div className="team-card__shade" aria-hidden="true" />
              <div className="team-card__scan" aria-hidden="true" />
              <div className="team-card__content">
                <div className="team-card__topline">
                  <span>ID: 0{index + 1}</span>
                  <span>ONLINE</span>
                </div>
                <h3>{card.title}</h3>
                <p className="team-card__meta-line">ROLE: {card.meta}</p>
                <p className="team-card__role">{card.description}</p>
                <span className="team-card__barcode" aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
