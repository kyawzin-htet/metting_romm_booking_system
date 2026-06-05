import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type MobileActionCardProps = {
  className: string;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

export function MobileActionCard({
  className,
  icon,
  title,
  description,
  onClick
}: MobileActionCardProps) {
  return (
    <button type="button" className={`mobile-card-trigger ${className}`} onClick={onClick}>
      <span className="panel-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="trigger-action">
        Open
        <ChevronDown size={16} />
      </span>
    </button>
  );
}
