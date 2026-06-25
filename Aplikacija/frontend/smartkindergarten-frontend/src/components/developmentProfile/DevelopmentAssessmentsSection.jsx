import { FaEdit, FaPlus, FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import DatePickerInput from "../common/DatePickerInput";
import {
  developmentAreas,
  getDevelopmentAreaLabel,
} from "../../constants/developmentAreas";

function DevelopmentAssessmentsSection({
  assessments,
  selectedArea,
  assessmentForm,
  editingAssessmentId,
  canManage,
  isSaving,
  onAreaFilterChange,
  onAssessmentChange,
  onAssessmentSubmit,
  onCancelEditAssessment,
  onStartEditAssessment,
  onDeleteAssessment,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Procene razvoja</h5>

          <select
            className="form-select w-auto"
            value={selectedArea}
            onChange={(event) => onAreaFilterChange(event.target.value)}
          >
            {developmentAreas.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </div>

        {canManage && (
          <form onSubmit={onAssessmentSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Oblast razvoja</label>
                <select
                  name="area"
                  className="form-select"
                  value={assessmentForm.area}
                  onChange={onAssessmentChange}
                  required
                >
                  {developmentAreas.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Ocena</label>
                <input
                  name="score"
                  type="number"
                  min="1"
                  max="5"
                  className="form-control"
                  value={assessmentForm.score}
                  onChange={onAssessmentChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Datum procene</label>
                <DatePickerInput
                  name="assessmentDate"
                  value={assessmentForm.assessmentDate}
                  onChange={onAssessmentChange}
                  required
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">Komentar</label>
                <textarea
                  name="comment"
                  className="form-control"
                  rows="3"
                  value={assessmentForm.comment}
                  onChange={onAssessmentChange}
                  placeholder="Kratak komentar uz procenu..."
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {editingAssessmentId ? (
                  <FaSave className="me-2" />
                ) : (
                  <FaPlus className="me-2" />
                )}
                {editingAssessmentId ? "Sačuvaj izmenu" : "Dodaj procenu"}
              </button>

              {editingAssessmentId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCancelEditAssessment}
                >
                  <FaTimes className="me-2" />
                  Otkaži
                </button>
              )}
            </div>
          </form>
        )}

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Oblast</th>
                <th>Ocena</th>
                <th>Vaspitač</th>
                <th>Komentar</th>
                {canManage && <th className="text-end">Akcije</th>}
              </tr>
            </thead>

            <tbody>
              {assessments.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? "6" : "5"}
                    className="text-center text-muted"
                  >
                    Nema procena za izabranu oblast.
                  </td>
                </tr>
              )}

              {assessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td>{formatDate(assessment.assessmentDate)}</td>
                  <td>{getDevelopmentAreaLabel(assessment.area)}</td>
                  <td>
                    <span className="badge bg-primary">
                      {assessment.score}/5
                    </span>
                  </td>
                  <td>{assessment.teacherFullName}</td>
                  <td>{assessment.comment || "Bez komentara"}</td>

                  {canManage && (
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => onStartEditAssessment(assessment)}
                      >
                        <FaEdit className="me-2" />
                        Izmeni
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDeleteAssessment(assessment)}
                      >
                        <FaTrashAlt className="me-2" />
                        Obriši
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) 
{
  return new Date(value).toLocaleDateString("sr-RS");
}

export default DevelopmentAssessmentsSection;
