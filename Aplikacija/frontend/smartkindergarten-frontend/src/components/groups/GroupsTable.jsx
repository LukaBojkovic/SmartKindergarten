import { FaEdit, FaTrashAlt } from "react-icons/fa";

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
    <div className="table-responsive actions-table-wrapper">
      <table className="table table-striped table-hover align-middle groups-table app-table">
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
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-primary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    Akcije
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => onSelect(group)}
                      >
                        Detalji
                      </button>
                    </li>

                    {canManage && (
                      <>
                        <li>
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => onEdit(group)}
                          >
                            <FaEdit className="me-2" />
                            Izmeni
                          </button>
                        </li>

                        <li>
                          <hr className="dropdown-divider" />
                        </li>

                        <li>
                          <button
                            className="dropdown-item text-danger"
                            type="button"
                            onClick={() => onDelete(group)}
                          >
                            <FaTrashAlt className="me-2" />
                            Obriši
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GroupsTable;
