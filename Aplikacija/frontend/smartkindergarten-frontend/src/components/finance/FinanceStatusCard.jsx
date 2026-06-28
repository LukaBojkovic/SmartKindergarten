import { formatCurrency, formatDate } from "../../utils/formatters";

function FinanceStatusCard({ status, isLoading, monthlyFee, numberOfMonths }) {
  if (isLoading) {
    return (
      <div className="alert alert-info">
        Učitavanje finansijskog statusa...
      </div>
    );
  }

  if (!status) {
    return (
      <div className="alert alert-info">
        Izaberi dete za prikaz finansijskog statusa.
      </div>
    );
  }

  const balanceStatus = getBalanceStatus(status.balance);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">Finansijski status</h5>
            <p className="text-muted mb-0">{status.childFullName}</p>
          </div>

          {status.balance !== null && status.balance !== undefined && (
            <span className={`badge ${balanceStatus.className}`}>
              {balanceStatus.text}
            </span>
          )}
        </div>

        {monthlyFee && numberOfMonths && status.expectedAmount !== null && (
          <div className="alert alert-secondary">
            Obračun: {numberOfMonths} mesec/i × {formatCurrency(monthlyFee)} ={" "}
            <strong>{formatCurrency(status.expectedAmount)}</strong>
          </div>
        )}

        <div className="row g-3">
          <div className="col-md-3">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Ukupno plaćeno</div>
              <div className="fs-5 fw-semibold">
                {formatCurrency(status.totalPaid)}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Očekivana obaveza</div>
              <div className="fs-5 fw-semibold">
                {status.expectedAmount !== null &&
                status.expectedAmount !== undefined
                  ? formatCurrency(status.expectedAmount)
                  : "-"}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Dugovanje / pretplata</div>
              <div className="fs-5 fw-semibold">
                {formatBalance(status.balance)}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Broj uplata</div>
              <div className="fs-5 fw-semibold">{status.paymentCount}</div>
            </div>
          </div>
        </div>

        <div className="text-muted small mt-3">
          Poslednja uplata:{" "}
          {status.lastPaymentDate ? formatDate(status.lastPaymentDate) : "-"}
        </div>
      </div>
    </div>
  );
}

function getBalanceStatus(balance) {
  if (balance === null || balance === undefined) {
    return {
      text: "Nije izračunato",
      className: "bg-secondary",
    };
  }

  if (balance > 0) {
    return {
      text: "Dugovanje",
      className: "bg-danger",
    };
  }

  if (balance < 0) {
    return {
      text: "Pretplata",
      className: "bg-info text-dark",
    };
  }

  return {
    text: "Izmireno",
    className: "bg-success",
  };
}

function formatBalance(balance) {
  if (balance === null || balance === undefined) {
    return "-";
  }

  if (balance > 0) {
    return `Dugovanje: ${formatCurrency(balance)}`;
  }

  if (balance < 0) {
    return `Pretplata: ${formatCurrency(Math.abs(balance))}`;
  }

  return "Izmireno";
}

export default FinanceStatusCard;
