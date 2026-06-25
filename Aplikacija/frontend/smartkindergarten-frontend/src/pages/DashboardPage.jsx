import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  FaBell,
  FaCalendarCheck,
  FaChartLine,
  FaChild,
  FaClipboardList,
  FaCog,
  FaLayerGroup,
  FaMoneyBillWave,
  FaUsers,
} from "react-icons/fa";

function DashboardPage() {
  const { user } = useAuth();

  const cardsByRole = {
    Administrator: [
      { title: "Korisnici", text: "Upravljanje korisničkim nalozima.", path: "/users", icon: <FaUsers />},
      { title: "Deca", text: "Pregled i upravljanje podacima o deci.", path: "/children", icon: <FaChild />},
      { title: "Grupe", text: "Upravljanje vrtićkim grupama.", path: "/groups", icon: <FaLayerGroup />},
      { title: "Razvojni profil", text: "Pregled razvojnih profila dece.", path: "/development-profile", icon: <FaChartLine />},
      { title: "Prisustvo", text: "Pregled i evidencija prisustva.", path: "/attendance", icon: <FaCalendarCheck />},
      { title: "Dnevni izveštaji", text: "Pregled dnevnih izveštaja.", path: "/daily-reports",  icon: <FaClipboardList />},
      { title: "Obaveštenja", text: "Pregled i slanje obaveštenja.", path: "/notifications", icon: <FaBell />},
      { title: "Finansije", text: "Pregled i upravljanje uplatama.", path: "/finance", icon: <FaMoneyBillWave />},
      { title: "Podešavanja", text: "Osnovna sistemska podešavanja.", path: "/system-settings", icon: <FaCog />},
    ],
    Teacher: [
      { title: "Deca", text: "Pregled dece iz dodeljenih grupa.", path: "/children", icon: <FaChild />},
      { title: "Grupe", text: "Pregled dodeljenih grupa.", path: "/groups", icon: <FaLayerGroup />},
      { title: "Razvojni profil", text: "Beleške, procene i napredak deteta.", path: "/development-profile", icon: <FaChartLine />},
      { title: "Prisustvo", text: "Evidencija prisustva dece.", path: "/attendance", icon: <FaCalendarCheck />},
      { title: "Dnevni izveštaji", text: "Kreiranje i pregled izveštaja.", path: "/daily-reports", icon: <FaClipboardList />},
      { title: "Obaveštenja", text: "Pregled i slanje obaveštenja.", path: "/notifications", icon: <FaBell />},
    ],
    Parent: [
      { title: "Razvojni profil", text: "Pregled razvoja deteta.", path: "/development-profile", icon: <FaChartLine />},
      { title: "Dnevni izveštaji", text: "Pregled dnevnih aktivnosti.", path: "/daily-reports", icon: <FaClipboardList />},
      { title: "Obaveštenja", text: "Pregled obaveštenja vrtića.", path: "/notifications", icon: <FaBell />},
      { title: "Finansije", text: "Pregled uplata i dugovanja.", path: "/finance", icon: <FaMoneyBillWave />},
    ],
    AdministrativeStaff: [
      { title: "Deca", text: "Administrativni pregled dece.", path: "/children", icon: <FaChild />},
      { title: "Prisustvo", text: "Pregled evidencije prisustva.", path: "/attendance", icon: <FaCalendarCheck />},
      { title: "Obaveštenja", text: "Pregled i slanje obaveštenja.", path: "/notifications", icon: <FaBell />},
      { title: "Finansije", text: "Upravljanje uplatama.", path: "/finance", icon: <FaMoneyBillWave />, },
    ],
  };

  const cards = cardsByRole[user?.role] || [];

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h1>Kontrolna tabla</h1>
        <p className="text-muted">
          Prijavljeni korisnik: {user?.fullName} | Uloga: {user?.role}
        </p>
      </div>

      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-md-6 col-lg-4" key={card.path}>
             <div className="card shadow-sm h-100 dashboard-card">
              <div className="card-body">
                <div className="dashboard-card-icon">{card.icon}</div>
                
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text text-muted">{card.text}</p>

                <Link className="btn btn-primary btn-sm" to={card.path}>
                  Otvori
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;