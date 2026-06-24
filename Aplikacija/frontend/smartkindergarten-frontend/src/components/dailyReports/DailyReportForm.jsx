import DatePickerInput from "../common/DatePickerInput";

function DailyReportForm({
  groups,
  form,
  editingReportId,
  isSaving,
  canCreate,
  canEdit,
  onChange,
  onImageChange,
  onClearImage,
  onSubmit,
  onCancelEdit,
}) {

  if (!canCreate && !canEdit) {
    return null;
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">
          {editingReportId ? "Izmena dnevnog izveštaja" : "Novi dnevni izveštaj"}
        </h5>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Grupa</label>
            <select
              name="groupId"
              className="form-select"
              value={form.groupId}
              onChange={onChange}
              required
              disabled={Boolean(editingReportId)}
            >
              <option value="">Izaberi grupu</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Datum izveštaja</label>
            <DatePickerInput
              name="reportDate"
              value={form.reportDate}
              onChange={onChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Naslov</label>
            <input
              name="title"
              className="form-control"
              value={form.title}
              onChange={onChange}
              placeholder="Npr. Aktivnosti tokom dana"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Sadržaj</label>
            <textarea
              name="content"
              className="form-control"
              rows="5"
              value={form.content}
              onChange={onChange}
              placeholder="Unesi opis dnevnih aktivnosti..."
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="dailyReportImage">
              Slika
            </label>

            <input
              id="dailyReportImage"
              type="file"
              className="form-control"
              accept="image/jpeg,image/png,image/webp"
              onChange={onImageChange}
            />

            <div className="form-text">
              Slika je opciona. Dozvoljeni formati su JPG, PNG i WEBP. Maksimalna
              veličina slike je 500 KB.
            </div>

            {form.imageUrl && (
              <div className="daily-report-image-preview-wrapper mt-3">
                <img
                  src={form.imageUrl}
                  alt="Pregled slike dnevnog izveštaja"
                  className="daily-report-image-preview"
                />

                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={onClearImage}
                  >
                    Ukloni sliku
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Čuvanje..."
                : editingReportId
                  ? "Sačuvaj izmene"
                  : "Kreiraj izveštaj"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancelEdit}
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DailyReportForm;