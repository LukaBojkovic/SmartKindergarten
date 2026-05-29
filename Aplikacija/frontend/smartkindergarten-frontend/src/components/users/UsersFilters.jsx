function UsersFilters({
  userRoles,
  roleFilter,
  activeFilter,
  onRoleFilterChange,
  onActiveFilterChange,
}) {
  return (
    <div className="d-flex flex-column flex-md-row gap-3 mb-3">
      <div className="flex-fill">
        <label className="form-label">Filter po ulozi</label>
        <select
          className="form-select"
          value={roleFilter}
          onChange={(event) => onRoleFilterChange(event.target.value)}
        >
          <option value="">Sve uloge</option>
          {userRoles.map((role) => (
            <option value={role} key={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-fill">
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={activeFilter}
          onChange={(event) => onActiveFilterChange(event.target.value)}
        >
          <option value="">Svi</option>
          <option value="true">Aktivni</option>
          <option value="false">Neaktivni</option>
        </select>
      </div>
    </div>
  );
}

export default UsersFilters;