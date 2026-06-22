import Select from "react-select";

function FinanceFilters({
  childOptions,
  selectedChildOption,
  expectedAmount,
  searchFilter,
  isLoadingChildren,
  onChildChange,
  onExpectedAmountChange,
  onSearchFilterChange,
  onClearFilters,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Filteri</h5>

        <div className="row g-3">
          <div className="col-lg-5">
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
            <label className="form-label">Očekivani iznos</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={expectedAmount}
              onChange={(event) => onExpectedAmountChange(event.target.value)}
              placeholder="Npr. 15000"
            />
          </div>

          <div className="col-lg-4">
            <label className="form-label">Pretraga uplata</label>
            <input
              className="form-control"
              value={searchFilter}
              onChange={(event) => onSearchFilterChange(event.target.value)}
              placeholder="Opis, dete, evidentirao..."
            />
          </div>
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

export default FinanceFilters;