import { FaEdit, FaPlus, FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";

function DevelopmentNotesSection({
  notes,
  canManage,
  noteForm,
  editingNoteId,
  isSaving,
  onNoteChange,
  onNoteSubmit,
  onCancelEditNote,
  onStartEditNote,
  onDeleteNote,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Razvojne beleške</h5>

        {canManage && (
          <form onSubmit={onNoteSubmit} className="mb-4">
            <div className="mb-3">
              <label className="form-label">Tekst beleške</label>
              <textarea
                name="content"
                className="form-control"
                rows="3"
                value={noteForm.content}
                onChange={onNoteChange}
                placeholder="Unesi zapažanje o razvoju deteta..."
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {editingNoteId ? (
                  <FaSave className="me-2" />
                ) : (
                  <FaPlus className="me-2" />
                )}
                {editingNoteId ? "Sačuvaj izmenu" : "Dodaj belešku"}
              </button>

              {editingNoteId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCancelEditNote}
                >
                  <FaTimes className="me-2" />
                  Otkaži
                </button>
              )}
            </div>
          </form>
        )}

        {notes.length === 0 && (
          <div className="alert alert-info mb-0">
            Nema razvojnih beleški za izabrano dete.
          </div>
        )}

        <div className="list-group">
          {notes.map((note) => (
            <div key={note.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1">{note.content}</p>

                  <small className="text-muted">
                    {note.teacherFullName} ·{" "}
                    {formatDateTime(note.createdAt)}
                  </small>
                </div>

                {canManage && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onStartEditNote(note)}
                    >
                      <FaEdit className="me-2" />
                      Izmeni
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDeleteNote(note)}
                    >
                      <FaTrashAlt className="me-2" />
                      Obriši
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) 
{
  return new Date(value).toLocaleString("sr-RS");
}

export default DevelopmentNotesSection;
