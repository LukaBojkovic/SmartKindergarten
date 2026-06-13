function ChildrenTable({ childrenList, isLoading, canManage, onEdit, onDeactivate }) 
{
  if (isLoading) 
    return <div className="alert alert-info">Učitavanje dece...</div>;

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th>Ime i prezime</th>
            <th>Datum rođenja</th>
            <th>Grupa</th>
            <th>Roditelji</th>
            <th>Status</th>
            {canManage && <th className="text-end">Akcije</th>}
          </tr>
        </thead>

        <tbody>
          {childrenList.length === 0 && (
            <tr>
              <td
                colSpan={canManage ? "6" : "5"}
                className="text-center text-muted"
              >
                Nema dece za izabrane filtere.
              </td>
            </tr>
          )}

          {childrenList.map((child) => (
            <tr key={child.id}>
              <td>
                {child.firstName} {child.lastName}
              </td>

              <td>{formatDate(child.dateOfBirth)}</td>

              <td>{child.groupName || "Bez grupe"}</td>

              <td>
                {child.parents.length === 0
                  ? "Nema povezanih roditelja"
                  : child.parents.map((parent) => parent.fullName).join(", ")}
              </td>

              <td>
                {child.isActive ? (
                  <span className="badge bg-success">Aktivno</span>
                ) : (
                  <span className="badge bg-secondary">Neaktivno</span>
                )}
              </td>

              {canManage && (
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => onEdit(child)}
                  >
                    Izmeni
                  </button>

                  {child.isActive && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDeactivate(child)}
                    >
                      Deaktiviraj
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(dateValue)
{
  if (!dateValue)
    return "";

  return new Date(dateValue).toLocaleDateString("sr-RS");
}

export default ChildrenTable;