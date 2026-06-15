function GroupsTable({
  groups,
  isLoading,
  canManage,
  selectedGroupId,
  onSelect,
  onEdit,
  onDelete,
}) 
{
  if (isLoading)
    return <div className="alert alert-info">Učitavanje grupa...</div>;

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Opis</th>
            <th>Broj dece</th>
            <th>Broj vaspitača</th>
            <th className="text-end">Akcije</th>
          </tr>
        </thead>

        <tbody>
          {groups.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Nema grupa za prikaz.
              </td>
            </tr>
          )}

          {groups.map((group) => (
            <tr
              key={group.id}
              className={selectedGroupId === group.id ? "table-primary" : ""}
            >
              <td>{group.name}</td>
              <td>{group.description || "Bez opisa"}</td>
              <td>{group.children.length}</td>
              <td>{group.teachers.length}</td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-outline-info me-2"
                  onClick={() => onSelect(group)}
                >
                  Detalji
                </button>

                {canManage && (
                  <>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => onEdit(group)}
                    >
                      Izmeni
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(group)}
                    >
                      Obriši
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GroupsTable;