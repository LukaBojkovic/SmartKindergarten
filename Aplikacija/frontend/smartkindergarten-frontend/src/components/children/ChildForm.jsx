import DatePickerInput from "../common/DatePickerInput";

function ChildForm({
  groups,
  editingChildId,
  createForm,
  editForm,
  isSaving,
  onCreateChange,
  onEditChange,
  onCreateSubmit,
  onEditSubmit,
  onCancelEdit,
}) {
  if (!editingChildId)
    {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Novo dete</h5>

          <form onSubmit={onCreateSubmit}>
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
              <label className="form-label">Datum rođenja</label>
              <DatePickerInput
              name="dateOfBirth"
              value={createForm.dateOfBirth}
              onChange={onCreateChange}
              required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Grupa</label>
              <select
                name="groupId"
                className="form-select"
                value={createForm.groupId}
                onChange={onCreateChange}
              >
                <option value="">Bez grupe</option>
                {groups.map((group) => (
                  <option value={group.id} key={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Napomene</label>
              <textarea
                name="notes"
                className="form-control"
                rows="3"
                value={createForm.notes}
                onChange={onCreateChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSaving}
            >
              {isSaving ? "Čuvanje..." : "Kreiraj dete"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Izmena deteta</h5>

        <form onSubmit={onEditSubmit}>
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
            <label className="form-label">Datum rođenja</label>
            <DatePickerInput
            name="dateOfBirth"
            value={editForm.dateOfBirth}
            onChange={onEditChange}
            required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Grupa</label>
            <select
              name="groupId"
              className="form-select"
              value={editForm.groupId}
              onChange={onEditChange}
            >
              <option value="">Bez grupe</option>
              {groups.map((group) => (
                <option value={group.id} key={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Napomene</label>
            <textarea
              name="notes"
              className="form-control"
              rows="3"
              value={editForm.notes}
              onChange={onEditChange}
            />
          </div>

          <div className="form-check mb-3">
            <input
              name="isActive"
              type="checkbox"
              className="form-check-input"
              checked={editForm.isActive}
              onChange={onEditChange}
              id="childIsActiveCheck"
            />
            <label className="form-check-label" htmlFor="childIsActiveCheck">
              Aktivno dete
            </label>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSaving}
            >
              Sačuvaj izmene
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancelEdit}
            >
              Nazad na dodavanje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChildForm;