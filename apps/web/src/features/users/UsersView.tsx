import { Plus, Users } from "lucide-react";
import type { FormEvent } from "react";
import { MobileActionCard } from "../../components/ui/MobileActionCard";
import { ModalPanel } from "../../components/ui/ModalPanel";
import { PanelTitle } from "../../components/ui/PanelTitle";
import type { NewUserFormState, Role, User } from "../../types/domain";
import { UserForm } from "./UserForm";
import { UserTable } from "./UserTable";

type UsersViewProps = {
  users: User[];
  roles: Role[];
  newUserForm: NewUserFormState;
  addUserDialogOpen: boolean;
  userSubmitting: boolean;
  onOpenAddUserDialog: () => void;
  onCloseAddUserDialog: () => void;
  onCreateUser: (event: FormEvent) => void;
  onNewUserFormChange: (form: NewUserFormState) => void;
  onRoleChange: (userId: number, role: Role) => void;
  onDeleteUser: (userId: number) => void;
};

export function UsersView({
  users,
  roles,
  newUserForm,
  addUserDialogOpen,
  userSubmitting,
  onOpenAddUserDialog,
  onCloseAddUserDialog,
  onCreateUser,
  onNewUserFormChange,
  onRoleChange,
  onDeleteUser
}: UsersViewProps) {
  return (
    <div className="users-grid">
      <MobileActionCard
        className="mobile-add-user-trigger"
        icon={<Plus size={24} />}
        title="Add User"
        description="Create a new team member"
        onClick={onOpenAddUserDialog}
      />

      <section className="panel add-user-panel">
        <PanelTitle
          icon={<Plus size={30} />}
          title="Add User"
          description="Create a new team member"
        />
        <UserForm
          form={newUserForm}
          roles={roles}
          submitting={userSubmitting}
          onSubmit={onCreateUser}
          onChange={onNewUserFormChange}
        />
      </section>

      <section className="panel team-panel">
        <div className="panel-bar">
          <PanelTitle
            icon={<Users size={29} />}
            title="Team Members"
            description="Manage user roles and permissions"
          />
          <span className="count-pill">{users.length} users</span>
        </div>

        <UserTable
          users={users}
          roles={roles}
          onRoleChange={onRoleChange}
          onDeleteUser={onDeleteUser}
        />
      </section>

      {addUserDialogOpen && (
        <ModalPanel
          ariaLabel="Add User"
          className="add-user-dialog"
          icon={<Plus size={30} />}
          title="Add User"
          description="Create a new team member"
          closeLabel="Close add user dialog"
          onClose={onCloseAddUserDialog}
        >
          <UserForm
            className="stack-form dialog-form"
            form={newUserForm}
            roles={roles}
            submitting={userSubmitting}
            onSubmit={onCreateUser}
            onChange={onNewUserFormChange}
          />
        </ModalPanel>
      )}
    </div>
  );
}
