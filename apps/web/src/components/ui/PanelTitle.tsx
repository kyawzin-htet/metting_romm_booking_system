import type { ReactNode } from "react";

type PanelTitleProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function PanelTitle({ icon, title, description }: PanelTitleProps) {
  return (
    <div className="panel-title">
      <div className="panel-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
