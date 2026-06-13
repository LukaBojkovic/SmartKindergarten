function ChildrenFilters({
  groups,
  searchFilter,
  groupFilter,
  activeFilter,
  onSearchFilterChange,
  onGroupFilterChange,
  onActiveFilterChange,
}) 
{
  return (
    <div className="d-flex flex-column flex-md-row gap-3 mb-3">
      <div className="flex-fill">
        <label className="form-label">Pretraga</label>
        <input
          className="form-control"
          value={searchFilter}
          onChange={(event) => onSearchFilterChange(event.target.value)}
          placeholder="Ime ili prezime deteta"
        />
      </div>

      <div className="flex-fill">
        <label className="form-label">Grupa</label>
        <select
          className="form-select"
          value={groupFilter}
          onChange={(event) => onGroupFilterChange(event.target.value)}
        >
          <option value="">Sve grupe</option>
          {groups.map((group) => (
            <option value={group.id} key={group.id}>
              {group.name}
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
          <option value="">Sva deca</option>
          <option value="true">Aktivna</option>
          <option value="false">Neaktivna</option>
        </select>
      </div>
    </div>
  );
}

export default ChildrenFilters;