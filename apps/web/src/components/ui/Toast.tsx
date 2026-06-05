import { X } from "lucide-react";

type ToastProps = {
  error: string;
  status: string;
  onDismiss: () => void;
};

export function Toast({ error, status, onDismiss }: ToastProps) {
  if (!error && !status) {
    return null;
  }

  return (
    <div
      className={`toast toast-${error ? "error" : "success"}`}
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
    >
      <span className="toast-dot" />
      <p>{error || status}</p>
      <button
        type="button"
        className="toast-dismiss"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <X size={15} />
      </button>
    </div>
  );
}
