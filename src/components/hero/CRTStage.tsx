import { type ReactNode } from 'react';

type CRTStageProps = {
  children: ReactNode;
};

export default function CRTStage({ children }: CRTStageProps) {
  return (
    <div className="crt-stage-shell">
      <div className="crt-power-line" aria-hidden="true" />
      <div className="crt-stage">
        {children}
        <div className="crt-vignette" aria-hidden="true" />
      </div>
    </div>
  );
}
