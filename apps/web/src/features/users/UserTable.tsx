import { Trash2 } from "lucide-react";
import type { Role, User } from "../../types/domain";
import { canDeleteUser } from "../../utils/permissions";
import { initials } from "../../utils/user";

type UserTableProps = {
  users: User[];
  roles: Role[];
  onRoleChange: (userId: number, role: Role) => void;
  onDeleteUser: (userId: number) => void;
};

export function UserTable({ users, roles, onRoleChange, onDeleteUser }: UserTableProps) {
  return (
    <div className="team-list">
      {users.map((user) => (
        <article className="team-row" key={user.id}>
          <div className="avatar large">{initials(user.name)}</div>
          <div className="team-copy">
            <h3>{user.name}</h3>
            <p>ID: #{user.id}</p>
          </div>
          <select
            value={user.role}
            onChange={(event) => onRoleChange(user.id, event.target.value as Role)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            className="icon-button"
            type="button"
            aria-label={canDeleteUser(user) ? "Delete user" : "Ada Admin cannot be deleted"}
            title={canDeleteUser(user) ? "Delete user" : "Ada Admin cannot be deleted"}
            disabled={!canDeleteUser(user)}
            onClick={() => onDeleteUser(user.id)}
          >
            <Trash2 size={22} />
          </button>
        </article>
      ))}
    </div>
  );
}
