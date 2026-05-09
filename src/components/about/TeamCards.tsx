import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { badgeIdentities, type BadgeIdentity } from '../../data/content';
import { usePointer } from '../../hooks/usePointer';
import LanyardErrorBoundary from './LanyardErrorBoundary';
import type { LanyardProfile } from './Lanyard';
import AboutLaserDivider from './AboutLaserDivider';

const ReactBitsLanyard = lazy(() => import('./Lanyard'));
const SMALL_SCREEN_QUERY = '(max-width: 760px)';
const LANYARD_BREAKPOINT_QUERY = '(max-width: 1180px)';

const initialsById: Record<string, string> = {
  sergey: 'SS',
  yan: 'YZ'
};

function toLanyardProfile(badge: BadgeIdentity): LanyardProfile {
  return {
    id: badge.meta.id,
    name: badge.name,
    role: badge.role,
    description: badge.description,
    metaRole: badge.meta.role,
    status: badge.meta.status,
    initials: initialsById[badge.id] ?? badge.name.slice(0, 2)
  };
}

export default function TeamCards() {
  const { reducedMotion, finePointer } = usePointer();
  const smallScreen = useMediaQuery(SMALL_SCREEN_QUERY);
  const belowLanyardBreakpoint = useMediaQuery(LANYARD_BREAKPOINT_QUERY);
  const [sceneFailed, setSceneFailed] = useState(false);
  const profiles = useMemo(() => badgeIdentities.map(toLanyardProfile), []);
  const shouldUseStaticCards = reducedMotion || !finePointer || smallScreen || belowLanyardBreakpoint || sceneFailed;

  if (shouldUseStaticCards) {
    return <StaticTeamCards profiles={profiles} />;
  }

  return (
    <LanyardErrorBoundary fallback={<StaticTeamCards profiles={profiles} />}>
      <div className="team-lanyards" aria-label="Карточки участников команды">
        {profiles[0] ? (
          <article className="team-lanyard-card" key={profiles[0].id} aria-labelledby={`${profiles[0].id}-lanyard-name`}>
            <Suspense fallback={<div className="team-lanyard-loading" aria-hidden="true">[ loading lanyard badge ]</div>}>
              <ReactBitsLanyard
                fov={19}
                gravity={[0, -40, 0]}
                onSceneError={() => setSceneFailed(true)}
                position={[0, 0, 13.5]}
                profile={profiles[0]}
              />
            </Suspense>
            <div className="sr-only">
              <section>
                <h3 id={`${profiles[0].id}-lanyard-name`}>{profiles[0].name}</h3>
                <p>{profiles[0].role}</p>
              </section>
            </div>
          </article>
        ) : null}
        <AboutLaserDivider />
        {profiles[1] ? (
          <article className="team-lanyard-card" key={profiles[1].id} aria-labelledby={`${profiles[1].id}-lanyard-name`}>
            <Suspense fallback={<div className="team-lanyard-loading" aria-hidden="true">[ loading lanyard badge ]</div>}>
              <ReactBitsLanyard
                fov={19}
                gravity={[0, -40, 0]}
                onSceneError={() => setSceneFailed(true)}
                position={[0, 0, 13.5]}
                profile={profiles[1]}
              />
            </Suspense>
            <div className="sr-only">
              <section>
                <h3 id={`${profiles[1].id}-lanyard-name`}>{profiles[1].name}</h3>
                <p>{profiles[1].role}</p>
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </LanyardErrorBoundary>
  );
}

function useMediaQuery(queryText: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(queryText);
    const update = () => setMatches(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, [queryText]);

  return matches;
}

function StaticTeamCards({ profiles }: { profiles: LanyardProfile[] }) {
  return (
    <div className="team-cards" aria-label="Карточки участников команды">
      {profiles.map((profile) => (
        <article className="team-card team-card--ascii" key={profile.id}>
          <span className="team-card__punch" aria-hidden="true" />
          <div className="team-card__ascii" aria-hidden="true">
            <span className="team-card__initials">{profile.initials}</span>
            <span>{`ID: ${profile.id}`}</span>
            <span>{profile.metaRole}</span>
            <span>{`status: ${profile.status}`}</span>
          </div>
          <div className="team-card__shade" aria-hidden="true" />
          <div className="team-card__scan" aria-hidden="true" />
          <div className="team-card__content">
            <div className="team-card__topline">
              <span>ID: {profile.id}</span>
              <span>{profile.status}</span>
            </div>
            <h3>{profile.name}</h3>
            <p className="team-card__meta-line">ROLE: {profile.metaRole}</p>
            <p className="team-card__meta-line">STATUS: {profile.status}</p>
            <p className="team-card__role">{profile.role}</p>
            <span className="team-card__barcode" aria-hidden="true" />
          </div>
        </article>
      ))}
    </div>
  );
}
