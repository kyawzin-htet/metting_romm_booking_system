import { LoaderCircle, Plus } from "lucide-react";
import type { FormEvent } from "react";
import type { NewUserFormState, Role } from "../../types/domain";

type UserFormProps = {
  form: NewUserFormState;
  roles: Role[];
  submitting: boolean;
  className?: string;
  onSubmit: (event: FormEvent) => void;
  onChange: (form: NewUserFormState) => void;
};

export function UserForm({
  form,
  roles,
  submitting,
  className = "stack-form",
  onSubmit,
  onChange
}: UserFormProps) {
  return (
    <form className={className} onSubmit={onSubmit}>
      <div className="field-block">
        <label>Name</label>
        <input
          value={form.name}
          placeholder="Enter full name"
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          required
        />
      </div>

      <div className="field-block">
        <label>Role</label>
        <select
          value={form.role}
          onChange={(event) => onChange({ ...form, role: event.target.value as Role })}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? <LoaderCircle className="loading-icon" size={22} /> : <Plus size={22} />}
        {submitting ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
