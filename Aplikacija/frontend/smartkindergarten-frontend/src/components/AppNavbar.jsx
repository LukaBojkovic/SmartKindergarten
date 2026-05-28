import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          SmartKindergarten
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user?.role === "Administrator" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/users">
                    Korisnici
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/children">
                    Deca
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/groups">
                    Grupe
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/system-settings">
                    Podešavanja
                  </Link>
                </li>
              </>
            )}

            {user?.role === "Teacher" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/children">
                    Deca
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/groups">
                    Grupe
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/development-profile">
                    Razvojni profil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/attendance">
                    Prisustvo
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/daily-reports">
                    Dnevni izveštaji
                  </Link>
                </li>
              </>
            )}

            {user?.role === "Parent" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/development-profile">
                    Razvojni profil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/daily-reports">
                    Dnevni izveštaji
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/notifications">
                    Obaveštenja
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/finance">
                    Finansije
                  </Link>
                </li>
              </>
            )}

            {user?.role === "AdministrativeStaff" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/children">
                    Deca
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/finance">
                    Finansije
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3 text-white">
            <span>
              {user?.fullName} ({user?.role})
            </span>

            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Odjava
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;