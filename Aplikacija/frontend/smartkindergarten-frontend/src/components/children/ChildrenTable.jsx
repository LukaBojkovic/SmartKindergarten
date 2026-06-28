import { FaEdit, FaTrashAlt, FaUsers } from "react-icons/fa";
import { formatDate } from "../../utils/formatters";

function ChildrenTable({
   childrenList,
   isLoading,
   canManage,
   selectedChildId,
   onEdit, 
   onDeactivate,
   onManageParents,
  }) 
{
  if (isLoading) 
    return <div className="alert alert-info">Učitavanje dece...</div>;

  return (
    <div className="table-responsive actions-table-wrapper">
      <table className="table table-striped table-hover align-middle children-table app-table">
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
            <tr 
            key={child.id}
            className={selectedChildId === child.id ? "table-primary" : ""}
            >
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
                          onClick={() => onManageParents(child)}
                        >
                          <FaUsers className="me-2" />
                          Roditelji
                        </button>
                      </li>

                      <li>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => onEdit(child)}
                        >
                          <FaEdit className="me-2" />
                          Izmeni
                        </button>
                      </li>

                      {child.isActive && (
                        <>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              type="button"
                              onClick={() => onDeactivate(child)}
                            >
                              <FaTrashAlt className="me-2" />
                              Deaktiviraj
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChildrenTable;
