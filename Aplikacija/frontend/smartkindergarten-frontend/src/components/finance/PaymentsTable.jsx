import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { formatCurrency, formatDate } from "../../utils/formatters";

function PaymentsTable({
  payments,
  isLoading,
  canManage,
  onStartEdit,
  onDelete,
}) {
  if (isLoading) {
    return <div className="alert alert-info">Učitavanje uplata...</div>;
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Uplate</h5>

        <div className="payments-table-wrapper">
          <table className="table table-striped table-hover align-middle app-table payments-table">
            <thead>
              <tr>
                <th>Dete</th>
                <th>Iznos</th>
                <th>Datum</th>
                <th>Opis</th>
                <th>Evidentirao</th>
                {canManage && <th className="text-end">Akcije</th>}
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? "6" : "5"}
                    className="text-center text-muted"
                  >
                    Nema uplata za prikaz.
                  </td>
                </tr>
              )}

              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.childFullName}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>{payment.description || "Bez opisa"}</td>
                  <td>{payment.recordedByFullName}</td>

                  {canManage && (
                    <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-primary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Akcije
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              type="button"
                              onClick={() => onStartEdit(payment)}
                            >
                              <FaEdit className="me-2" />
                              Izmeni
                            </button>
                          </li>

                          <li>
                            <hr className="dropdown-divider" />
                          </li>

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              type="button"
                              onClick={() => onDelete(payment)}
                            >
                              <FaTrashAlt className="me-2" />
                              Obriši
                            </button>
                          </li>
                        </ul>
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

export default PaymentsTable;
