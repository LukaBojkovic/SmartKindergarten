function UsersTables({ users, isLoading, onEdit, onDeactivate })
 {
  if (isLoading)
    return <div className="alert alert-info">Učitavanje korisnika...</div>;

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
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
              <td>{user.username}</td>
              <td>
                {user.firstName} {user.lastName}
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.isActive ? (
                  <span className="badge bg-success">Aktivan</span>
                ) : (
                  <span className="badge bg-secondary">Neaktivan</span>
                )}
              </td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onEdit(user)}
                >
                  Izmeni
                </button>

                {user.isActive && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDeactivate(user)}
                  >
                    Deaktiviraj
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTables;