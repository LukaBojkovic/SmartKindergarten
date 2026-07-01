import { FaPaperPlane, FaSave, FaTimes, FaUsers } from "react-icons/fa";
import Select from "react-select";

function NotificationForm({
  form,
  selectedRecipients,
  recipientOptions,
  recipientGroupOptions,
  recipientGroupFilter,
  editingNotificationId,
  isSaving,
  onChange,
  onRecipientsChange,
  onRecipientGroupFilterChange,
  onSelectAllRecipients,
  onClearRecipients,
  onSubmit,
  onCancelEdit,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">
          {editingNotificationId ? "Izmena obaveštenja" : "Novo obaveštenje"}
        </h5>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Naslov</label>
            <input
              name="title"
              className="form-control"
              value={form.title}
              onChange={onChange}
              placeholder="Unesi naslov obaveštenja"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Sadržaj</label>
            <textarea
              name="content"
              className="form-control"
              rows="4"
              value={form.content}
              onChange={onChange}
              placeholder="Unesi tekst obaveštenja"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Primaoci</label>
            {!editingNotificationId && recipientGroupOptions.length > 0 && (
              <div className="mb-2">
                <select
                  className="form-select"
                  value={recipientGroupFilter}
                  onChange={(event) =>
                    onRecipientGroupFilterChange(event.target.value)
                  }
                >
                  <option value="">Sve moje grupe</option>
                  {recipientGroupOptions.map((groupOption) => (
                    <option key={groupOption.value} value={groupOption.value}>
                      {groupOption.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Select
              classNamePrefix="app-select"
              value={selectedRecipients}
              onChange={onRecipientsChange}
              options={recipientOptions}
              placeholder="Izaberi primaoce..."
              isMulti
              isDisabled={Boolean(editingNotificationId)}
            />
          {!editingNotificationId && (
          <div className="d-flex gap-2 mt-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={onSelectAllRecipients}
              disabled={recipientOptions.length === 0}
            >
              <FaUsers className="me-2" />
              Izaberi sve dostupne primaoce
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onClearRecipients}
              disabled={selectedRecipients.length === 0}
            >
              <FaTimes className="me-2" />
              Poništi izbor
            </button>
          </div>
            )}

            {editingNotificationId && (
              <div className="form-text">
                Primaoci se ne menjaju prilikom izmene obaveštenja.
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isSaving ||
                (!editingNotificationId && selectedRecipients.length === 0)
              }
            >
              {editingNotificationId ? (
                <FaSave className="me-2" />
              ) : (
                <FaPaperPlane className="me-2" />
              )}
              {isSaving
                ? "Čuvanje..."
                : editingNotificationId
                  ? "Sačuvaj izmene"
                  : "Pošalji obaveštenje"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancelEdit}
            >
              <FaTimes className="me-2" />
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NotificationForm;
