/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import systemSettingsApi from "../api/systemSettingsApi";

function AppNavbar() 
{
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [kindergartenName, setKindergartenName] =
    useState("SmartKindergarten");

  const userId = user?.id ?? user?.userId;

  useEffect(() => {
    if (!isAuthenticated || !userId) 
    {
      setKindergartenName("SmartKindergarten");
      return;
    }

    let isCancelled = false;

    systemSettingsApi
      .getByKey("KindergartenName")
      .then((setting) => {
        if (!isCancelled && setting.value) {
          setKindergartenName(setting.value);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setKindergartenName("SmartKindergarten");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, userId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated)
    return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          {kindergartenName}
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
                   <Link className="nav-link" to="/attendance">
                   Prisustvo
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
                <li className="nav-item">
                   <Link className="nav-link" to="/notifications">
                   Obaveštenja
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
                   <Link className="nav-link" to="/attendance">
                    Prisustvo
                    </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/finance">
                    Finansije
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
                  <Link className="nav-link" to="/system-settings">
                    Podešavanja
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3 text-white">
            <span>
              {user?.fullName} ({user?.role})
            </span>

            <Link className="btn btn-outline-light btn-sm" to="/account">
              Moj nalog
            </Link>

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