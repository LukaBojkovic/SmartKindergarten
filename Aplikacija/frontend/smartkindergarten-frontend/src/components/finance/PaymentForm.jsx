import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import DatePickerInput from "../common/DatePickerInput";

function PaymentForm({
  form,
  editingPaymentId,
  selectedChildOption,
  isSaving,
  canManage,
  onChange,
  onSubmit,
  onCancelEdit,
}) {
  if (!canManage) {
    return null;
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">
          {editingPaymentId ? "Izmena uplate" : "Nova uplata"}
        </h5>

        {!selectedChildOption && (
          <div className="alert alert-info">
            Izaberi dete pre evidentiranja uplate.
          </div>
        )}

        {selectedChildOption && (
          <div className="alert alert-secondary">
            Dete: <strong>{selectedChildOption.label}</strong>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Iznos uplate</label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              className="form-control"
              value={form.amount}
              onChange={onChange}
              required
              disabled={!selectedChildOption}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Datum uplate</label>
            <DatePickerInput
              name="paymentDate"
              value={form.paymentDate}
              onChange={onChange}
              required
              disabled={!selectedChildOption}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Opis</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={form.description}
              onChange={onChange}
              placeholder="Npr. Mesečna članarina za jun"
              disabled={!selectedChildOption}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || !selectedChildOption}
            >
              {editingPaymentId ? (
                <FaSave className="me-2" />
              ) : (
                <FaPlus className="me-2" />
              )}
              {isSaving
                ? "Čuvanje..."
                : editingPaymentId
                  ? "Sačuvaj izmene"
                  : "Evidentiraj uplatu"}
            </button>

            {editingPaymentId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancelEdit}
              >
                <FaTimes className="me-2" />
                Otkaži
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentForm;
