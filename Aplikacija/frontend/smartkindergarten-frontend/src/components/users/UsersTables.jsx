import { FaEdit, FaKey, FaTrashAlt } from "react-icons/fa";

function UsersTables({ 
  users, 
  isLoading, 
  onEdit, 
  onDeactivate,
  onResetPassword,
 })
 {
  if (isLoading)
    return <div className="alert alert-info">Učitavanje korisnika...</div>;

  return (
    <div className="table-responsive users-table-wrapper">
      <table className="table table-striped table-hover align-middle users-table">
        <colgroup>
          <col className="users-table-username" />
          <col className="users-table-name" />
          <col className="users-table-email" />
          <col className="users-table-role" />
          <col className="users-table-status" />
          <col className="users-table-actions" />
        </colgroup>

        <thead>
          <tr>
            <th>Korisničko ime</th>
            <th>Ime i prezime</th>
            <th>Email</th>
            <th>Uloga</th>
            <th>Status</th>
            <th className="text-end">Akcije</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Nema korisnika za izabrane filtere.
              </td>
            </tr>
          )}

          {users.map((user) => (
            <tr key={user.id}>
              <td title={user.username}>{user.username}</td>
              <td title={`${user.firstName} ${user.lastName}`}>
                {user.firstName} {user.lastName}
              </td>
              <td title={user.email}>{user.email}</td>
              <td title={user.role}>{user.role}</td>
              <td>
                {user.isActive ? (
                  <span className="badge bg-success">Aktivan</span>
                ) : (
                  <span className="badge bg-secondary">Neaktivan</span>
                )}
              </td>
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
                        onClick={() => onEdit(user)}
                      >
                        <FaEdit className="me-2" />
                        Izmeni
                      </button>
                    </li>

                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => onResetPassword(user)}
                      >
                        <FaKey className="me-2" />
                        Reset lozinke
                      </button>
                    </li>

                  {user.isActive && (
                    <>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>

                      <li>
                        <button
                          className="dropdown-item text-danger"
                          type="button"
                          onClick={() => onDeactivate(user)}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTables;
