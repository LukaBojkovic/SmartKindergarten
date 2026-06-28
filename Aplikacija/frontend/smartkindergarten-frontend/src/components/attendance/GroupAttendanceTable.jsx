import { FaTrashAlt } from "react-icons/fa";
import { formatDate } from "../../utils/formatters";

function GroupAttendanceTable({
  attendance,
  isLoading,
  canManage,
  savingChildId,
  onSaveAttendance,
  onDeleteAttendance,
}) {
  if (isLoading) {
    return <div className="alert alert-info">Učitavanje prisustva...</div>;
  }

  if (!attendance) {
    return (
      <div className="alert alert-info">
        Izaberi grupu i datum za prikaz prisustva.
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="card-title mb-0">{attendance.groupName}</h5>
            <small className="text-muted">
              Datum: {formatDate(attendance.date)}
            </small>
          </div>

          <div className="text-muted">
            Evidentirano: {getRecordedCount(attendance.children)} /{" "}
            {attendance.children.length}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Dete</th>
                <th>Status</th>
                <th>Evidentirao</th>
                {canManage && <th className="text-end">Akcije</th>}
              </tr>
            </thead>

            <tbody>
              {attendance.children.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? "4" : "3"}
                    className="text-center text-muted"
                  >
                    U ovoj grupi nema aktivne dece.
                  </td>
                </tr>
              )}

              {attendance.children.map((child) => (
                <tr key={child.childId}>
                  <td>{child.childFullName}</td>

                  <td>
                    {child.isRecorded ? (
                      child.isPresent ? (
                        <span className="badge bg-success">Prisutan</span>
                      ) : (
                        <span className="badge bg-danger">Odsutan</span>
                      )
                    ) : (
                      <span className="badge bg-secondary">
                        Nije evidentirano
                      </span>
                    )}
                  </td>

                  <td>{child.recordedByFullName || "-"}</td>

                  {canManage && (
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-success"
                          disabled={
                            savingChildId === child.childId ||
                            (child.isRecorded && child.isPresent)
                          }
                          onClick={() => onSaveAttendance(child, true)}
                        >
                          Prisutan
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          disabled={
                            savingChildId === child.childId ||
                            (child.isRecorded && !child.isPresent)
                          }
                          onClick={() => onSaveAttendance(child, false)}
                        >
                          Odsutan
                        </button>

                        {child.isRecorded && (
                          <button
                            className="btn btn-outline-secondary"
                            disabled={savingChildId === child.childId}
                            onClick={() => onDeleteAttendance(child)}
                          >
                            <FaTrashAlt className="me-2" />
                            Obriši
                          </button>
                        )}
                      </div>
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

function getRecordedCount(children) {
  return children.filter((child) => child.isRecorded).length;
}

export default GroupAttendanceTable;
