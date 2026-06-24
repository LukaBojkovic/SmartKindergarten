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

        <div className="table-responsive">
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

function formatCurrency(value) {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("sr-RS");
}

export default PaymentsTable;
