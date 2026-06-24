/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import systemSettingsApi from "../api/systemSettingsApi";

const NAV_LINKS_BY_ROLE = {
  Administrator: [
    { to: "/users", label: "Korisnici" },
    { to: "/children", label: "Deca" },
    { to: "/groups", label: "Grupe" },
    { to: "/development-profile", label: "Razvojni profil" },
    { to: "/attendance", label: "Prisustvo" },
    { to: "/daily-reports", label: "Dnevni izveštaji" },
    { to: "/notifications", label: "Obaveštenja" },
    { to: "/finance", label: "Finansije" },
    { to: "/system-settings", label: "Podešavanja" },
  ],

  Teacher: [
    { to: "/children", label: "Deca" },
    { to: "/groups", label: "Grupe" },
    { to: "/development-profile", label: "Razvojni profil" },
    { to: "/attendance", label: "Prisustvo" },
    { to: "/daily-reports", label: "Dnevni izveštaji" },
    { to: "/notifications", label: "Obaveštenja" },
  ],

  Parent: [
    { to: "/development-profile", label: "Razvojni profil" },
    { to: "/daily-reports", label: "Dnevni izveštaji" },
    { to: "/notifications", label: "Obaveštenja" },
    { to: "/finance", label: "Finansije" },
  ],

  AdministrativeStaff: [
    { to: "/children", label: "Deca" },
    { to: "/attendance", label: "Prisustvo" },
    { to: "/notifications", label: "Obaveštenja" },
    { to: "/finance", label: "Finansije" },
  ],
};

function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [kindergartenName, setKindergartenName] =
    useState("SmartKindergarten");

  const userId = user?.id ?? user?.userId;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setKindergartenName("SmartKindergarten");
      return;
    }

    let isCancelled = false;

    const loadKindergartenName = () => {
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
  };

    loadKindergartenName();

    window.addEventListener("system-settings:updated", loadKindergartenName);

    return () => {
    isCancelled = true;
    window.removeEventListener(
      "system-settings:updated",
      loadKindergartenName
    );
  };
  }, [isAuthenticated, userId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = NAV_LINKS_BY_ROLE[user?.role] || [];

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-primary app-navbar">
      <div className="container-fluid px-4">
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
          <ul className="navbar-nav me-auto mb-2 mb-xl-0">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.to}>
                <Link className="nav-link" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="dropdown user-dropdown">
            <button
              className="btn btn-outline-light btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              {user?.fullName}
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-header">{user?.role}</span>
              </li>

              <li>
                <Link className="dropdown-item" to="/account">
                  Moj nalog
                </Link>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Odjava
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;