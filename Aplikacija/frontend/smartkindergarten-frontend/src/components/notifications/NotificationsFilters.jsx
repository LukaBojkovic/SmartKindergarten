function NotificationsFilters({
  isAdmin,
  scope,
  unreadOnly,
  searchFilter,
  onScopeChange,
  onUnreadOnlyChange,
  onSearchFilterChange,
  onClearFilters,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Filteri</h5>

        <div className="row g-3">
          {isAdmin && (
            <div className="col-md-4">
              <label className="form-label">Prikaz</label>
              <select
                className="form-select"
                value={scope}
                onChange={(event) => onScopeChange(event.target.value)}
              >
                <option value="my">Moja obaveštenja</option>
                <option value="all">Sva obaveštenja</option>
              </select>
            </div>
          )}

          <div className={isAdmin ? "col-md-4" : "col-md-6"}>
            <label className="form-label">Pretraga</label>
            <input
              className="form-control"
              value={searchFilter}
              onChange={(event) => onSearchFilterChange(event.target.value)}
              placeholder="Naslov, sadržaj ili pošiljalac"
            />
          </div>

          <div className={isAdmin ? "col-md-4" : "col-md-6"}>
            <label className="form-label">Status</label>

            <div className="form-check mt-2">
              <input
                id="unreadOnly"
                type="checkbox"
                className="form-check-input"
                checked={unreadOnly}
                onChange={(event) => onUnreadOnlyChange(event.target.checked)}
              />

              <label className="form-check-label" htmlFor="unreadOnly">
                Prikaži samo nepročitana moja obaveštenja
              </label>
            </div>
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

export default NotificationsFilters;