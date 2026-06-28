import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { formatDate } from "../../utils/formatters";

function DailyReportsList({
  reports,
  isLoading,
  getGroupName,
  canEditReport,
  canDeleteReport,
  onStartEdit,
  onDelete,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  if (isLoading) {
    return <div className="alert alert-info">Učitavanje dnevnih izveštaja...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="alert alert-info">
        Nema dnevnih izveštaja za izabrane filtere.
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {reports.map((report) => (
          <div key={report.id} className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <h5 className="card-title mb-1">{report.title}</h5>

                  <div className="text-muted small mb-3">
                    {formatDate(report.reportDate)} · {getGroupName(report.groupId)}
                  </div>
                </div>

                {(canEditReport(report) || canDeleteReport(report)) && (
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-outline-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      Akcije
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                      {canEditReport(report) && (
                        <li>
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => onStartEdit(report)}
                          >
                            <FaEdit className="me-2" />
                            Izmeni
                          </button>
                        </li>
                      )}

                      {canDeleteReport(report) && (
                        <>
                          {canEditReport(report) && (
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                          )}

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              type="button"
                              onClick={() => onDelete(report)}
                            >
                              <FaTrashAlt className="me-2" />
                              Obriši
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <p className="card-text">{report.content}</p>

              {report.imageUrl && (
                <div className="daily-report-list-image-wrapper mt-3">
                  <button
                    type="button"
                    className="daily-report-image-button"
                    onClick={() =>
                      setPreviewImage({
                        src: report.imageUrl,
                        title: report.title,
                      })
                    }
                  >
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="daily-report-list-image"
                    />
                  </button>

                  <div className="form-text mt-1">
                    Klikni na sliku za uvećan prikaz.
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div
          className="image-preview-backdrop"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="image-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{previewImage.title}</h5>

              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                onClick={() => setPreviewImage(null)}
              >
                Zatvori
              </button>
            </div>

            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="image-preview-modal-img"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default DailyReportsList;
