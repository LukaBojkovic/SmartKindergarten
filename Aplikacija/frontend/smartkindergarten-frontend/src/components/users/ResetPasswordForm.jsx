function ResetPasswordForm({
  selectedUser,
  form,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}) 
{
  if (!selectedUser)
    return null;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Reset lozinke</h5>

        <div className="alert alert-secondary">
          Korisnik:{" "}
          <strong>
            {selectedUser.firstName} {selectedUser.lastName}
          </strong>{" "}
          ({selectedUser.username})
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Nova lozinka</label>
            <input
              name="newPassword"
              type="password"
              className="form-control"
              value={form.newPassword}
              onChange={onChange}
              required
              minLength="6"
            />

            <div className="form-text">
              Nova lozinka mora imati najmanje 6 karaktera.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Potvrda nove lozinke</label>
            <input
              name="confirmPassword"
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={onChange}
              required
              minLength="6"
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-warning"
              disabled={isSaving}
            >
              {isSaving ? "Resetovanje..." : "Resetuj lozinku"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordForm;