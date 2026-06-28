/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import systemSettingsApi from "../api/systemSettingsApi";
import { SYSTEM_SETTING_KEYS } from "../constants/systemSettingKeys";
import { USER_ROLES } from "../constants/userRoles";

import {
  FaBell,
  FaCalendarCheck,
  FaChartLine,
  FaChild,
  FaClipboardList,
  FaCog,
  FaLayerGroup,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";

const NAV_LINKS_BY_ROLE = {
  [USER_ROLES.ADMINISTRATOR]: [
    { to: "/users", label: "Korisnici", icon: <FaUsers/>},
    { to: "/children", label: "Deca", icon: <FaChild/> },
    { to: "/groups", label: "Grupe", icon: <FaLayerGroup />  },
    { to: "/development-profile", label: "Razvojni profil", icon: <FaChartLine /> },
    { to: "/attendance", label: "Prisustvo", icon: <FaCalendarCheck /> },
    { to: "/daily-reports", label: "Dnevni izveštaji", icon: <FaClipboardList /> },
    { to: "/notifications", label: "Obaveštenja", icon: <FaBell /> },
    { to: "/finance", label: "Finansije", icon: <FaMoneyBillWave /> },
    { to: "/system-settings", label: "Podešavanja", icon: <FaCog /> },
  ],

  [USER_ROLES.TEACHER]: [
    { to: "/children", label: "Deca", icon: <FaChild /> },
    { to: "/groups", label: "Grupe", icon: <FaLayerGroup /> },
    { to: "/development-profile", label: "Razvojni profil", icon: <FaChartLine /> },
    { to: "/attendance", label: "Prisustvo", icon: <FaCalendarCheck /> },
    { to: "/daily-reports", label: "Dnevni izveštaji", icon: <FaClipboardList /> },
    { to: "/notifications", label: "Obaveštenja", icon: <FaBell /> },
  ],

  [USER_ROLES.PARENT]: [
    { to: "/development-profile", label: "Razvojni profil", icon: <FaChartLine /> },
    { to: "/daily-reports", label: "Dnevni izveštaji", icon: <FaClipboardList /> },
    { to: "/notifications", label: "Obaveštenja", icon: <FaBell /> },
    { to: "/finance", label: "Finansije", icon: <FaMoneyBillWave /> },
  ],

  [USER_ROLES.ADMINISTRATIVE_STAFF]: [
    { to: "/children", label: "Deca", icon: <FaChild /> },
    { to: "/notifications", label: "Obaveštenja", icon: <FaBell /> },
    { to: "/finance", label: "Finansije", icon: <FaMoneyBillWave /> },
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
      .getByKey(SYSTEM_SETTING_KEYS.KINDERGARTEN_NAME)
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
                  <span className="nav-link-content">
                    <span className="nav-link-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
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
              <FaUserCircle className="me-1" />
              {user?.fullName}
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-header">{user?.role}</span>
              </li>

              <li>
                <Link className="dropdown-item" to="/account">
                  <FaUserCircle className="me-2" />
                  Moj nalog
                </Link>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
               <button className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
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
