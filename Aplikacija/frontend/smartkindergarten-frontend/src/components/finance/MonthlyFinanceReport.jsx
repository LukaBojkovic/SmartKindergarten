import { useMemo, useState } from "react";
import { FaChartBar, FaDownload, FaSyncAlt, FaTimes } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatters";

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
  const [groupFilter, setGroupFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const selectedMonth = Number(reportMonth);
  const selectedYear = Number(reportYear);
  const monthlyFeeValue = Number(monthlyFee);
  const hasValidMonthlyFee =
    !Number.isNaN(monthlyFeeValue) && monthlyFeeValue > 0;

  const rows = useMemo(() => {
    if (
      !hasValidMonthlyFee ||
      !Number.isInteger(selectedMonth) ||
      !Number.isInteger(selectedYear)
    ) {
      return [];
    }

    const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const selectedMonthEnd = new Date(selectedYear, selectedMonth, 1);

    return childrenList.map((child) => {
      const childPayments = payments.filter(
        (payment) => Number(payment.childId) === Number(child.id)
      );

      const openingBalance = calculateOpeningCredit({
        payments: childPayments,
        selectedMonth,
        selectedYear,
        monthlyFee: monthlyFeeValue,
      });

      const paidInSelectedMonth = sumPayments(
        childPayments.filter((payment) =>
          isPaymentInDateRange(
            payment.paymentDate,
            selectedMonthStart,
            selectedMonthEnd
          )
        )
      );

      const closingBalance = normalizeCurrency(
        openingBalance + paidInSelectedMonth - monthlyFeeValue
      );

      return {
        childId: child.id,
        childFullName: `${child.firstName} ${child.lastName}`,
        groupId: child.groupId ? String(child.groupId) : "",
        groupName: child.groupName || "Bez grupe",
        openingBalance,
        monthlyFee: monthlyFeeValue,
        paidInSelectedMonth,
        closingBalance,
        status: getMonthlyPaymentStatus({
          openingBalance,
          paidInSelectedMonth,
          closingBalance,
        }),
      };
    });
  }, [
    childrenList,
    payments,
    monthlyFeeValue,
    hasValidMonthlyFee,
    selectedMonth,
    selectedYear,
  ]);

  const groupOptions = useMemo(() => {
    const groups = new Map();

    childrenList.forEach((child) => {
      const key = child.groupId ? String(child.groupId) : child.groupName || "";

      if (key) {
        groups.set(key, child.groupName || `Grupa ${child.groupId}`);
      }
    });

    return Array.from(groups.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [childrenList]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchFilter.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesGroup =
        !groupFilter ||
        row.groupId === groupFilter ||
        row.groupName === groupFilter;
      const matchesSearch =
        !normalizedSearch ||
        row.childFullName.toLowerCase().includes(normalizedSearch);

      return matchesGroup && matchesSearch;
    });
  }, [rows, groupFilter, searchFilter]);

  const summary = useMemo(() => {
    const totalExpected = filteredRows.reduce(
      (sum, row) => sum + row.monthlyFee,
      0
    );
    const totalPaidInMonth = filteredRows.reduce(
      (sum, row) => sum + row.paidInSelectedMonth,
      0
    );
    const totalDebtAtMonthEnd = filteredRows.reduce(
      (sum, row) => sum + Math.max(0, -row.closingBalance),
      0
    );

    return {
      childrenCount: filteredRows.length,
      totalExpected,
      totalPaidInMonth,
      totalDebtAtMonthEnd,
    };
  }, [filteredRows]);

  const clearReportFilters = () => {
    setGroupFilter("");
    setSearchFilter("");
  };

  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      return;
    }

    const selectedMonthLabel =
      MONTH_OPTIONS.find((month) => month.value === String(reportMonth))
        ?.label || reportMonth;

    const header = [
      "dete",
      "grupa",
      "mesec",
      "godina",
      "preneto stanje",
      "mesečna članarina",
      "uplaćeno u mesecu",
      "stanje na kraju meseca",
      "status",
    ];

    const reportRows = filteredRows.map((row) => [
      row.childFullName,
      row.groupName,
      selectedMonthLabel,
      reportYear,
      formatExcelNumber(row.openingBalance),
      formatExcelNumber(row.monthlyFee),
      formatExcelNumber(row.paidInSelectedMonth),
      formatExcelNumber(row.closingBalance),
      row.status,
    ]);

    const excelContent = createExcelHtml([header, ...reportRows]);

    const blob = new Blob(["\uFEFF", excelContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `finansijski-izvestaj-${reportYear}-${String(
      reportMonth
    ).padStart(2, "0")}.xls`;

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
              Pregled mesečne članarine, uplata u mesecu i prenetog stanja.
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
              onClick={handleExportExcel}
              disabled={
                isLoading || filteredRows.length === 0 || !hasValidMonthlyFee
              }
            >
              <FaDownload className="me-2" />
              Export Excel
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

              <div className="col-md-3">
                <label className="form-label" htmlFor="financeReportGroup">
                  Grupa
                </label>

                <select
                  id="financeReportGroup"
                  className="form-select"
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                >
                  <option value="">Sve grupe</option>
                  {groupOptions.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="financeReportSearch">
                  Pretraga deteta
                </label>

                <input
                  id="financeReportSearch"
                  className="form-control"
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  placeholder="Ime ili prezime deteta"
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={clearReportFilters}
            >
              <FaTimes className="me-2" />
              Očisti filtere
            </button>

            <div className="row g-3 mb-3">
              <SummaryItem label="Broj dece" value={summary.childrenCount} />

              <SummaryItem
                label="Ukupno očekivano za mesec"
                value={formatCurrency(summary.totalExpected)}
              />

              <SummaryItem
                label="Ukupno uplaćeno u mesecu"
                value={formatCurrency(summary.totalPaidInMonth)}
              />

              <SummaryItem
                label="Ukupno dugovanje na kraju meseca"
                value={formatCurrency(summary.totalDebtAtMonthEnd)}
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
                      <th>Preneto stanje</th>
                      <th>Mesečna članarina</th>
                      <th>Uplaćeno u mesecu</th>
                      <th>Stanje na kraju meseca</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          Nema dece za izabrane filtere.
                        </td>
                      </tr>
                    )}

                    {filteredRows.map((row) => (
                      <tr key={row.childId}>
                        <td>{row.childFullName}</td>
                        <td>{row.groupName}</td>
                        <td className={getBalanceClassName(row.openingBalance)}>
                          {formatCurrency(row.openingBalance)}
                        </td>
                        <td>{formatCurrency(row.monthlyFee)}</td>
                        <td>{formatCurrency(row.paidInSelectedMonth)}</td>
                        <td className={getBalanceClassName(row.closingBalance)}>
                          {formatCurrency(row.closingBalance)}
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

function sumPayments(payments) {
  return normalizeCurrency(
    payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  );
}

function calculateOpeningCredit({
  payments,
  selectedMonth,
  selectedYear,
  monthlyFee,
}) {
  let balance = 0;

  for (let month = 1; month < selectedMonth; month += 1) {
    const monthStart = new Date(selectedYear, month - 1, 1);
    const monthEnd = new Date(selectedYear, month, 1);
    const paidInMonth = sumPayments(
      payments.filter((payment) =>
        isPaymentInDateRange(payment.paymentDate, monthStart, monthEnd)
      )
    );

    balance = Math.max(0, normalizeCurrency(balance + paidInMonth - monthlyFee));
  }

  return normalizeCurrency(balance);
}

function isPaymentInDateRange(value, startDate, endDate) {
  const paymentDate = getPaymentDate(value);

  return paymentDate
    ? paymentDate >= startDate && paymentDate < endDate
    : false;
}

function getPaymentDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getMonthlyPaymentStatus({
  openingBalance,
  paidInSelectedMonth,
  closingBalance,
}) {
  if (closingBalance > 0) {
    return "Pretplata";
  }

  if (closingBalance === 0 && openingBalance > 0 && paidInSelectedMonth === 0) {
    return "Plaćeno iz pretplate";
  }

  if (closingBalance === 0) {
    return "Plaćeno";
  }

  if (closingBalance < 0 && (openingBalance > 0 || paidInSelectedMonth > 0)) {
    return "Delimično plaćeno";
  }

  return "Dugovanje";
}

function getStatusBadgeClass(status) {
  if (status === "Plaćeno" || status === "Plaćeno iz pretplate") {
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

function getBalanceClassName(value) {
  if (value < 0) {
    return "text-danger";
  }

  if (value > 0) {
    return "text-success";
  }

  return "";
}

function formatExcelNumber(value) {
  return Number(value || 0).toFixed(2).replace(".", ",");
}

function normalizeCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function createExcelHtml(rows) {
  const tableRows = rows
    .map(
      (row, rowIndex) =>
        `<tr>${row
          .map((value) => {
            const tagName = rowIndex === 0 ? "th" : "td";

            return `<${tagName}>${escapeHtml(value)}</${tagName}>`;
          })
          .join("")}</tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    table { border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 4px 8px; }
    th { font-weight: bold; background: #eeeeee; }
  </style>
</head>
<body>
  <table>${tableRows}</table>
</body>
</html>`;
}

function escapeHtml(value) {
  const text = String(value ?? "");

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default MonthlyFinanceReport;
