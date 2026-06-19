
function DailyReportsList({
  reports,
  isLoading,
  getGroupName,
  canEditReport,
  canDeleteReport,
  onStartEdit,
  onDelete,
}) {
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
                <div className="d-flex gap-2">
                  {canEditReport(report) && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onStartEdit(report)}
                    >
                      Izmeni
                    </button>
                  )}

                  {canDeleteReport(report) && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(report)}
                    >
                      Obriši
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="card-text">{report.content}</p>

            {report.imageUrl && (
              <div className="mt-3">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="img-fluid rounded border"
                  style={{ maxHeight: "280px", objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("sr-RS");
}

export default DailyReportsList;