import { X } from "lucide-react";
import type { ReactNode } from "react";
import { PanelTitle } from "./PanelTitle";

type ModalPanelProps = {
  ariaLabel: string;
  className: string;
  icon: ReactNode;
  title: string;
  description: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalPanel({
  ariaLabel,
  className,
  icon,
  title,
  description,
  closeLabel,
  onClose,
  children
}: ModalPanelProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className={`panel ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <PanelTitle icon={icon} title={title} description={description} />
          <button
            type="button"
            className="icon-button dialog-close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
