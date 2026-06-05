import { CalendarDays } from "lucide-react";
import type { User } from "../../types/domain";
import { UserSwitcher } from "./UserSwitcher";

type AppHeaderProps = {
  users: User[];
  currentUser: User | null;
  selectedUserId: number | null;
  loading: boolean;
  userMenuOpen: boolean;
  onToggleUserMenu: () => void;
  onCloseUserMenu: () => void;
  onSelectUser: (userId: number) => void;
};

export function AppHeader({
  users,
  currentUser,
  selectedUserId,
  loading,
  userMenuOpen,
  onToggleUserMenu,
  onCloseUserMenu,
  onSelectUser
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="page-frame header-content">
        <div className="brand">
          <div className="brand-icon">
            <CalendarDays size={25} />
          </div>
          <div>
            <h1>Meeting Room</h1>
            <p>Room booking system</p>
          </div>
        </div>

        <UserSwitcher
          users={users}
          currentUser={currentUser}
          selectedUserId={selectedUserId}
          loading={loading}
          isOpen={userMenuOpen}
          onToggle={onToggleUserMenu}
          onClose={onCloseUserMenu}
          onSelectUser={onSelectUser}
        />
      </div>
    </header>
  );
}
