import { badgeIdentities } from '../../data/content';
import sergeyProfilePhoto from '../../assets/team/sergey-smirnov.png';
import yanProfilePhoto from '../../assets/team/yan-zryanov.png';

const initialsById: Record<string, string> = {
  sergey: 'SS',
  yan: 'YZ'
};

const profilePhotosById: Partial<Record<string, string>> = {
  sergey: sergeyProfilePhoto,
  yan: yanProfilePhoto
};

export default function AboutSection() {
  return (
    <section className="about-section about-section--profiles" id="about">
      <div className="about-profiles">
        <div className="about-profile-stack" aria-label="Профили команды">
          {badgeIdentities.map((profile) => {
            const profilePhoto = profilePhotosById[profile.id];

            return (
              <article
                className={`about-profile-card about-profile-card--${profile.id} ${
                  profilePhoto ? 'about-profile-card--photo' : ''
                }`.trim()}
                key={profile.id}
              >
                <div
                  className={`about-profile-card__mark ${profilePhoto ? 'about-profile-card__mark--photo' : ''}`.trim()}
                  aria-hidden="true"
                >
                  {profilePhoto ? (
                    <img alt="" src={profilePhoto} />
                  ) : (
                    (initialsById[profile.id] ?? profile.name.slice(0, 2))
                  )}
                </div>
                <div className="about-profile-card__content">
                  <div className="about-profile-card__meta">
                    <span>ID {profile.meta.id}</span>
                    <span>{profile.meta.status}</span>
                  </div>
                  <h3>{profile.name}</h3>
                  <p className="about-profile-card__role">{profile.role}</p>
                  <p className="about-profile-card__description">{profile.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="about-profile-copy">
          <p className="section-label">[ О НАС ]</p>
          <h2>Два человека. Один цельный процесс.</h2>
          <p>
            Соединяем разработку, интерфейсы и визуальную систему, чтобы быстро превращать идеи в понятные цифровые
            продукты.
          </p>
          <div className="about-profile-lines" aria-label="Как мы работаем">
            <span>01 / идея становится структурой</span>
            <span>02 / структура становится интерфейсом</span>
            <span>03 / интерфейс становится продуктом</span>
          </div>
        </div>
      </div>
    </section>
  );
}
