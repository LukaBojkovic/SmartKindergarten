import DatePickerInput from "../common/DatePickerInput";

function DailyReportsFilters({
  groups,
  groupFilter,
  dateFilter,
  searchFilter,
  onGroupFilterChange,
  onDateFilterChange,
  onSearchFilterChange,
  onClearFilters,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Filteri</h5>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Grupa</label>
            <select
              className="form-select"
              value={groupFilter}
              onChange={(event) => onGroupFilterChange(event.target.value)}
            >
              <option value="">Sve grupe</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Datum</label>
            <DatePickerInput
              name="dateFilter"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value)}
              placeholder="Svi datumi"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Pretraga</label>
            <input
              className="form-control"
              value={searchFilter}
              onChange={(event) => onSearchFilterChange(event.target.value)}
              placeholder="Naslov ili sadržaj"
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

export default DailyReportsFilters;