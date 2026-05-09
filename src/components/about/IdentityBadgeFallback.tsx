import { badgeIdentities } from '../../data/content';
import { SpotlightSurface } from '../interaction/SpotlightSurface';

export default function IdentityBadgeFallback() {
  return (
    <div className="identity-fallback" aria-label="Участники команды">
      {badgeIdentities.map((badge) => (
        <SpotlightSurface as="article" className="identity-card identity-card--static" key={badge.id}>
          <div className="identity-card__head">
            <span>ID: {badge.meta.id}</span>
            <span>{badge.meta.status}</span>
          </div>
          <div className="identity-card__portrait" aria-hidden="true">
            {badge.id === 'sergey' ? 'SS' : 'YZ'}
          </div>
          <h3>{badge.name}</h3>
          <p className="identity-role">{badge.role}</p>
          <div className="identity-meta">
            <span>ROLE: {badge.meta.role}</span>
            <span>STATUS: {badge.meta.status}</span>
          </div>
        </SpotlightSurface>
      ))}
    </div>
  );
}
