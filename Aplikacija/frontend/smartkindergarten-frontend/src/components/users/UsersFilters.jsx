import { FaSearch, FaTimes } from "react-icons/fa";

function UsersFilters({
  userRoleOptions,
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchTermChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onClearFilters,
}) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">Filteri</h5>

        <div className="row g-3 align-items-end">
          <div className="col-lg-4 col-md-12">
            <label className="form-label">Pretraga</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                className="form-control"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Ime, korisničko ime ili email"
              />
            </div>
          </div>

          <div className="col-lg-3 col-md-4">
            <label className="form-label">Uloga</label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(event) => onRoleFilterChange(event.target.value)}
            >
              <option value="">Sve uloge</option>
              {userRoleOptions.map((roleOption) => (
                <option value={roleOption.value} key={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-4">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
            >
              <option value="">Svi statusi</option>
              <option value="true">Aktivni</option>
              <option value="false">Neaktivni</option>
            </select>
          </div>

          <div className="col-lg-3 col-md-4 d-grid">
            <button
              className="btn btn-outline-secondary text-nowrap"
              type="button"
              onClick={onClearFilters}
            >
              <FaTimes className="me-2" />
              Očisti filtere
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersFilters;
