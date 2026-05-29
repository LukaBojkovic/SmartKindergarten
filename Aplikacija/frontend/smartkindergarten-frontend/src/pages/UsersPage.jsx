/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import usersApi from "../api/usersApi";
import UserForm from "../components/users/UserForm";
import UsersFilters from "../components/users/UsersFilters";
import UsersTables from "../components/users/UsersTables";

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

function UsersPage()
 {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("true");

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editingUserId, setEditingUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);

    usersApi
      .getAll({
        role: roleFilter,
        isActive: activeFilter,
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
  }, [roleFilter, activeFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");

    try 
    {
      const data = await usersApi.getAll({
        role: roleFilter,
        isActive: activeFilter,
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
    setSuccessMessage("");

    try 
    {
      await usersApi.create(createForm);

      setCreateForm(initialCreateForm);
      setSuccessMessage("Korisnik je uspešno kreiran.");

      await loadUsers();
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });

    setError("");
    setSuccessMessage("");

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
    setSuccessMessage("");

    try 
    {
      await usersApi.update(editingUserId, editForm);

      setEditingUserId(null);
      setEditForm(initialEditForm);
      setSuccessMessage("Korisnik je uspešno ažuriran.");

      await loadUsers();
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    } finally 
    {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    const confirmed = window.confirm(
      `Da li sigurno želiš da deaktiviraš korisnika ${user.username}?`
    );

    if (!confirmed)
      return;

    setError("");
    setSuccessMessage("");

    try
    {
      await usersApi.deactivate(user.id);

      setSuccessMessage("Korisnik je deaktiviran.");
      await loadUsers();
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    }
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
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
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
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <UsersFilters
                userRoles={USER_ROLES}
                roleFilter={roleFilter}
                activeFilter={activeFilter}
                onRoleFilterChange={setRoleFilter}
                onActiveFilterChange={setActiveFilter}
              />

              <UsersTables
                users={users}
                isLoading={isLoading}
                onEdit={startEdit}
                onDeactivate={handleDeactivate}
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