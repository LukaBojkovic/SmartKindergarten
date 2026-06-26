/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import usersApi from "../api/usersApi";
import UserForm from "../components/users/UserForm";
import UsersFilters from "../components/users/UsersFilters";
import UsersTables from "../components/users/UsersTables";
import ResetPasswordForm from "../components/users/ResetPasswordForm";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";

const USER_ROLES = [
  "Administrator",
  "Teacher",
  "Parent",
  "AdministrativeStaff",
];

const initialCreateForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "Parent",
};

const initialEditForm = {
  email: "",
  firstName: "",
  lastName: "",
  role: "Parent",
  isActive: true,
};

const initialResetPasswordForm = {
  newPassword: "",
  confirmPassword: "",
};

function UsersPage()
 {
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editingUserId, setEditingUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = 
    useState(initialResetPasswordForm);

  const [isResetPasswordSaving, setIsResetPasswordSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);

    usersApi
      .getAll({
        role: "",
        isActive: "",
      })
      .then((data) => {
        if (!isCancelled) {
          setUsers(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");

    try 
    {
      const data = await usersApi.getAll({
        role: "",
        isActive: "",
      });

      setUsers(data);
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    }
     finally 
    {
      setIsLoading(false);
    }
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setError("");

    try 
    {
      await usersApi.create(createForm);

      setCreateForm(initialCreateForm);
      toast.success("Korisnik je uspešno kreiran.");

      await loadUsers();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  const startEdit = (user) => {
    setResetPasswordUser(null);
    setResetPasswordForm(initialResetPasswordForm);

    setEditingUserId(user.id);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });

    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm(initialEditForm);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingUserId)
      return;

    setIsSaving(true);
    setError("");

    try 
    {
      await usersApi.update(editingUserId, editForm);

      setEditingUserId(null);
      setEditForm(initialEditForm);
      toast.success("Korisnik je uspešno ažuriran.");

      await loadUsers();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    } finally 
    {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    const confirmed = await confirm({
      title: "Deaktivacija korisnika",
      message: `Da li sigurno želiš da deaktiviraš korisnika ${user.username}?`,
      confirmText: "Deaktiviraj",
    });

    if (!confirmed)
      return;

    setError("");

    try
    {
      await usersApi.deactivate(user.id);

      toast.success("Korisnik je deaktiviran.");
      await loadUsers();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const startResetPassword = (user) => {
    setEditingUserId(null);
    setEditForm(initialEditForm);
    
    setResetPasswordUser(user);
    setResetPasswordForm(initialResetPasswordForm);

    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
};

const cancelResetPassword = () => {
  setResetPasswordUser(null);
  setResetPasswordForm(initialResetPasswordForm);
};

const handleResetPasswordChange = (event) => {
  const { name, value } = event.target;

  setResetPasswordForm((previousForm) => ({
    ...previousForm,
    [name]: value,
  }));
};

  const handleResetPasswordSubmit = async (event) => {
  event.preventDefault();

  if (!resetPasswordUser)
    return;

  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword)
  {
    setError("");
    toast.error("Nova lozinka i potvrda lozinke se ne poklapaju.");
    return;
  }

  if (resetPasswordForm.newPassword.length < 6) 
  {
    setError("");
    toast.error("Nova lozinka mora imati najmanje 6 karaktera.");
    return;
  }

  setIsResetPasswordSaving(true);
  setError("");

  try 
  {
    await usersApi
    .resetPassword(resetPasswordUser.id, resetPasswordForm.newPassword);

    toast.success(
      `Lozinka za korisnika ${resetPasswordUser.username} je uspešno resetovana.`
    );

    setResetPasswordUser(null);
    setResetPasswordForm(initialResetPasswordForm);
  } 
  catch (requestError) 
  {
    toast.error(getErrorMessage(requestError));
  } 
  finally 
  {
    setIsResetPasswordSaving(false);
  }
};

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`;
      const searchableText = [
        fullName,
        user.username,
        user.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const matchesRole = !roleFilter || user.role === roleFilter;

      const matchesStatus =
        !statusFilter ||
        (Object.prototype.hasOwnProperty.call(user, "isActive") &&
          String(user.isActive) === statusFilter);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Korisnici</h1>
          <p className="text-muted mb-0">
            Pregled i upravljanje korisničkim nalozima.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={loadUsers}>
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4 align-items-start">
        <div className="col-lg-4">
          {resetPasswordUser ? (
            <ResetPasswordForm
              selectedUser={resetPasswordUser}
              form={resetPasswordForm}
              isSaving={isResetPasswordSaving}
              onChange={handleResetPasswordChange}
              onSubmit={handleResetPasswordSubmit}
              onCancel={cancelResetPassword}
          />
          ) : (
          <UserForm
            userRoles={USER_ROLES}
            editingUserId={editingUserId}
            createForm={createForm}
            editForm={editForm}
            isSaving={isSaving}
            onCreateChange={handleCreateChange}
            onEditChange={handleEditChange}
            onCreateSubmit={handleCreateSubmit}
            onEditSubmit={handleEditSubmit}
            onCancelEdit={cancelEdit}
          />
      )}
      </div>

        <div className="col-lg-8">
          <UsersFilters
            userRoles={USER_ROLES}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchTermChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={clearFilters}
          />

          <div className="card shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-3">
                Prikazano: {filteredUsers.length} od {users.length} korisnika
              </p>

              <UsersTables
                users={filteredUsers}
                isLoading={isLoading}
                onEdit={startEdit}
                onDeactivate={handleDeactivate}
                onResetPassword={startResetPassword}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error) {
  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default UsersPage;
