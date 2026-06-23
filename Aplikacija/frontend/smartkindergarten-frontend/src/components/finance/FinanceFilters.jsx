import Select from "react-select";

function FinanceFilters({
  childOptions,
  selectedChildOption,
  monthlyFee,
  numberOfMonths,
  expectedAmount,
  searchFilter,
  isLoadingChildren,
  isLoadingMonthlyFee,
  onChildChange,
  onNumberOfMonthsChange,
  onSearchFilterChange,
  onClearFilters,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Izbor deteta i obračun</h5>

        <div className="row g-3">
          <div className="col-lg-4">
            <label className="form-label">Dete</label>
            <Select
              value={selectedChildOption}
              onChange={onChildChange}
              options={childOptions}
              placeholder={
                isLoadingChildren ? "Učitavanje dece..." : "Izaberi dete..."
              }
              isDisabled={isLoadingChildren}
              isClearable
            />
          </div>

          <div className="col-lg-3">
            <label className="form-label">Mesečna članarina</label>
            <input
              className="form-control"
              value={
                isLoadingMonthlyFee
                  ? "Učitavanje..."
                  : monthlyFee
                    ? formatCurrency(monthlyFee)
                    : "Nije podešena"
              }
              disabled
            />
          </div>

          <div className="col-lg-2">
            <label className="form-label">Broj meseci</label>
            <input
              type="number"
              min="1"
              step="1"
              className="form-control"
              value={numberOfMonths}
              onChange={(event) => onNumberOfMonthsChange(event.target.value)}
            />
          </div>

          <div className="col-lg-3">
            <label className="form-label">Očekivana obaveza</label>
            <input
              className="form-control"
              value={expectedAmount ? formatCurrency(expectedAmount) : "-"}
              disabled
            />
          </div>

          <div className="col-lg-12">
            <label className="form-label">Pretraga liste uplata</label>
            <input
              className="form-control"
              value={searchFilter}
              onChange={(event) => onSearchFilterChange(event.target.value)}
              placeholder="Opis, dete, evidentirao..."
            />
          </div>
        </div>

        <div className="form-text mt-2">
          Očekivana obaveza se računa kao: mesečna članarina × broj meseci.
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm mt-3"
          onClick={onClearFilters}
        >
          Očisti filtere
        </button>
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

export default FinanceFilters;