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
          <table className="table table-striped table-hover align-middle">
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
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => onStartEdit(payment)}
                      >
                        Izmeni
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(payment)}
                      >
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
