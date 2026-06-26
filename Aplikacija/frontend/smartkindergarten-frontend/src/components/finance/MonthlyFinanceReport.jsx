import { useMemo } from "react";
import { FaChartBar, FaDownload, FaSyncAlt } from "react-icons/fa";

const MONTH_OPTIONS = [
  { value: "1", label: "Januar" },
  { value: "2", label: "Februar" },
  { value: "3", label: "Mart" },
  { value: "4", label: "April" },
  { value: "5", label: "Maj" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Avgust" },
  { value: "9", label: "Septembar" },
  { value: "10", label: "Oktobar" },
  { value: "11", label: "Novembar" },
  { value: "12", label: "Decembar" },
];

function MonthlyFinanceReport({
  childrenList,
  payments,
  monthlyFee,
  reportMonth,
  reportYear,
  isLoading,
  onMonthChange,
  onYearChange,
  onRefresh,
}) {
  const monthlyFeeValue = Number(monthlyFee);

  const hasValidMonthlyFee =
    !Number.isNaN(monthlyFeeValue) && monthlyFeeValue > 0;

  const rows = useMemo(() => {
    if (!hasValidMonthlyFee) {
      return [];
    }

    return childrenList.map((child) => {
      const childPaymentsForMonth = payments.filter((payment) => {
        return (
          payment.childId === child.id &&
          isPaymentInSelectedMonth(
            payment.paymentDate,
            Number(reportMonth),
            Number(reportYear)
          )
        );
      });

      const paidAmount = childPaymentsForMonth.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      const difference = paidAmount - monthlyFeeValue;

      return {
        childId: child.id,
        childFullName: `${child.firstName} ${child.lastName}`,
        groupName: child.groupName || "Bez grupe",
        monthlyFee: monthlyFeeValue,
        paidAmount,
        difference,
        status: getMonthlyPaymentStatus(paidAmount, monthlyFeeValue),
      };
    });
  }, [
    childrenList,
    payments,
    monthlyFeeValue,
    hasValidMonthlyFee,
    reportMonth,
    reportYear,
  ]);

  const summary = useMemo(() => {
    const totalExpected = rows.reduce((sum, row) => sum + row.monthlyFee, 0);
    const totalPaid = rows.reduce((sum, row) => sum + row.paidAmount, 0);
    const totalDebt = rows.reduce(
      (sum, row) => sum + Math.max(0, -row.difference),
      0
    );
    const totalOverpayment = rows.reduce(
      (sum, row) => sum + Math.max(0, row.difference),
      0
    );

    return {
      childrenCount: rows.length,
      totalExpected,
      totalPaid,
      totalDebt,
      totalOverpayment,
    };
  }, [rows]);

  const handleExportCsv = () => {
    if (rows.length === 0) {
      return;
    }

    const selectedMonthLabel =
      MONTH_OPTIONS.find((month) => month.value === String(reportMonth))
        ?.label || reportMonth;

    const header = [
      "Dete",
      "Grupa",
      "Mesec",
      "Godina",
      "Mesečna članarina",
      "Uplaćeno",
      "Razlika",
      "Status",
    ];

    const csvRows = rows.map((row) => [
      row.childFullName,
      row.groupName,
      selectedMonthLabel,
      reportYear,
      formatCsvNumber(row.monthlyFee),
      formatCsvNumber(row.paidAmount),
      formatCsvNumber(row.difference),
      row.status,
    ]);

    const csvContent =
      "\uFEFF" +
      [header, ...csvRows]
        .map((row) => row.map(escapeCsvValue).join(";"))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `finansijski-izvestaj-${reportYear}-${String(
      reportMonth
    ).padStart(2, "0")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h5 className="card-title mb-1">
              <FaChartBar className="me-2" />
              Mesečni finansijski izveštaj
            </h5>

            <p className="text-muted mb-0">
              Pregled očekivanih uplata, evidentiranih uplata, dugovanja i
              pretplata za izabrani mesec.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <FaSyncAlt className="me-2" />
              Osveži
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleExportCsv}
              disabled={isLoading || rows.length === 0 || !hasValidMonthlyFee}
            >
              <FaDownload className="me-2" />
              Export CSV
            </button>
          </div>
        </div>

        {!hasValidMonthlyFee && (
          <div className="alert alert-warning mb-0">
            Mesečna članarina nije podešena ili nije ispravna. Izveštaj ne može
            da se izračuna.
          </div>
        )}

        {hasValidMonthlyFee && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label" htmlFor="financeReportMonth">
                  Mesec
                </label>

                <select
                  id="financeReportMonth"
                  className="form-select"
                  value={reportMonth}
                  onChange={(event) => onMonthChange(event.target.value)}
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="financeReportYear">
                  Godina
                </label>

                <input
                  id="financeReportYear"
                  type="number"
                  className="form-control"
                  min="2020"
                  max="2100"
                  value={reportYear}
                  onChange={(event) => onYearChange(event.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <SummaryItem
                label="Broj dece"
                value={summary.childrenCount}
              />

              <SummaryItem
                label="Ukupno očekivano"
                value={formatCurrency(summary.totalExpected)}
              />

              <SummaryItem
                label="Ukupno uplaćeno"
                value={formatCurrency(summary.totalPaid)}
              />

              <SummaryItem
                label="Ukupno dugovanje"
                value={formatCurrency(summary.totalDebt)}
              />

              <SummaryItem
                label="Ukupna pretplata"
                value={formatCurrency(summary.totalOverpayment)}
              />
            </div>

            {isLoading ? (
              <div className="alert alert-info mb-0">
                Učitavanje finansijskog izveštaja...
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle app-table finance-report-table">
                  <thead>
                    <tr>
                      <th>Dete</th>
                      <th>Grupa</th>
                      <th>Mesečna članarina</th>
                      <th>Uplaćeno</th>
                      <th>Razlika</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          Nema dece za prikaz u izveštaju.
                        </td>
                      </tr>
                    )}

                    {rows.map((row) => (
                      <tr key={row.childId}>
                        <td>{row.childFullName}</td>
                        <td>{row.groupName}</td>
                        <td>{formatCurrency(row.monthlyFee)}</td>
                        <td>{formatCurrency(row.paidAmount)}</td>
                        <td className={row.difference < 0 ? "text-danger" : ""}>
                          {formatCurrency(row.difference)}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(row.status)}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="col-sm-6 col-lg">
      <div className="finance-summary-item">
        <div className="text-muted small">{label}</div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );
}

function isPaymentInSelectedMonth(value, month, year) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

function getMonthlyPaymentStatus(paidAmount, monthlyFee) {
  if (paidAmount === monthlyFee) {
    return "Plaćeno";
  }

  if (paidAmount === 0) {
    return "Dugovanje";
  }

  if (paidAmount > 0 && paidAmount < monthlyFee) {
    return "Delimično plaćeno";
  }

  return "Pretplata";
}

function getStatusBadgeClass(status) {
  if (status === "Plaćeno") {
    return "badge bg-success";
  }

  if (status === "Delimično plaćeno") {
    return "badge bg-warning text-dark";
  }

  if (status === "Pretplata") {
    return "badge bg-info text-dark";
  }

  return "badge bg-danger";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
  }).format(value || 0);
}

function formatCsvNumber(value) {
  return Number(value || 0).toFixed(2).replace(".", ",");
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export default MonthlyFinanceReport;