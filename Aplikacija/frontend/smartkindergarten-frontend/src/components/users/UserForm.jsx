import { FaPlus, FaSave, FaUndo } from "react-icons/fa";

function UserForm({
  userRoles,
  editingUserId,
  createForm,
  editForm,
  isSaving,
  onCreateChange,
  onEditChange,
  onCreateSubmit,
  onEditSubmit,
  onCancelEdit,
}) {
  if (!editingUserId) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Novi korisnik</h5>

          <form onSubmit={onCreateSubmit}>
            <div className="mb-3">
              <label className="form-label">Korisničko ime</label>
              <input
                name="username"
                className="form-control"
                value={createForm.username}
                onChange={onCreateChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={createForm.email}
                onChange={onCreateChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Lozinka</label>
              <input
                name="password"
                type="password"
                className="form-control"
                value={createForm.password}
                onChange={onCreateChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ime</label>
              <input
                name="firstName"
                className="form-control"
                value={createForm.firstName}
                onChange={onCreateChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Prezime</label>
              <input
                name="lastName"
                className="form-control"
                value={createForm.lastName}
                onChange={onCreateChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Uloga</label>
              <select
                name="role"
                className="form-select"
                value={createForm.role}
                onChange={onCreateChange}
              >
                {userRoles.map((role) => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSaving}
            >
              <FaPlus className="me-2" />
              {isSaving ? "Čuvanje..." : "Kreiraj korisnika"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Izmena korisnika</h5>

        <form onSubmit={onEditSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              value={editForm.email}
              onChange={onEditChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Ime</label>
            <input
              name="firstName"
              className="form-control"
              value={editForm.firstName}
              onChange={onEditChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Prezime</label>
            <input
              name="lastName"
              className="form-control"
              value={editForm.lastName}
              onChange={onEditChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Uloga</label>
            <select
              name="role"
              className="form-select"
              value={editForm.role}
              onChange={onEditChange}
            >
              {userRoles.map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-check mb-3">
            <input
              name="isActive"
              type="checkbox"
              className="form-check-input"
              checked={editForm.isActive}
              onChange={onEditChange}
              id="isActiveCheck"
            />
            <label className="form-check-label" htmlFor="isActiveCheck">
              Aktivan nalog
            </label>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSaving}
            >
              <FaSave className="me-2" />
              Sačuvaj izmene
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancelEdit}
            >
              <FaUndo className="me-2" />
              Nazad na dodavanje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
