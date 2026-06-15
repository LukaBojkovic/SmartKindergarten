function GroupForm({
  editingGroupId,
  createForm,
  editForm,
  isSaving,
  onCreateChange,
  onEditChange,
  onCreateSubmit,
  onEditSubmit,
  onCancelEdit,
}) 
{
  if (!editingGroupId) 
    {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Nova grupa</h5>

          <form onSubmit={onCreateSubmit}>
            <div className="mb-3">
              <label className="form-label">Naziv grupe</label>
              <input
                name="name"
                className="form-control"
                value={createForm.name}
                onChange={onCreateChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Opis</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={createForm.description}
                onChange={onCreateChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSaving}
            >
              {isSaving ? "Čuvanje..." : "Kreiraj grupu"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Izmena grupe</h5>

        <form onSubmit={onEditSubmit}>
          <div className="mb-3">
            <label className="form-label">Naziv grupe</label>
            <input
              name="name"
              className="form-control"
              value={editForm.name}
              onChange={onEditChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Opis</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={editForm.description}
              onChange={onEditChange}
            />
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

export default GroupForm;