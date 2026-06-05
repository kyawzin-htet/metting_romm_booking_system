import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import type { User } from "../../types/domain";
import { initials } from "../../utils/user";

type UserSwitcherProps = {
  users: User[];
  currentUser: User | null;
  selectedUserId: number | null;
  loading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
};

export function UserSwitcher({
  users,
  currentUser,
  selectedUserId,
  loading,
  isOpen,
  onToggle,
  onClose,
  onSelectUser
}: UserSwitcherProps) {
  const userSwitcherRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeUserMenuOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || userSwitcherRef.current?.contains(target)) {
        return;
      }
      onClose();
    }

    document.addEventListener("pointerdown", closeUserMenuOnOutsideClick);

    return () => document.removeEventListener("pointerdown", closeUserMenuOnOutsideClick);
  }, [isOpen, onClose]);

  return (
    <div className="user-switcher" ref={userSwitcherRef}>
      <span>Acting as</span>
      <button
        type="button"
        className="user-trigger"
        onClick={onToggle}
        disabled={loading || users.length === 0}
      >
        {currentUser && <span className="avatar small">{initials(currentUser.name)}</span>}
        <strong>{currentUser?.role ?? "-"}</strong>
        <ChevronDown size={18} />
      </button>
      {isOpen && (
        <div className="user-menu">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className="user-option"
              onClick={() => onSelectUser(user.id)}
            >
              <span>{user.name}</span>
              <span className={`role-tag role-${user.role}`}>{user.role}</span>
              {user.id === selectedUserId && <Check size={20} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
