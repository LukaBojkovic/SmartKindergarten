import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function DashboardPage() {
  const { user } = useAuth();

  const cardsByRole = {
    Administrator: [
      { title: "Korisnici", text: "Upravljanje korisničkim nalozima.", path: "/users" },
      { title: "Deca", text: "Pregled i upravljanje podacima o deci.", path: "/children" },
      { title: "Grupe", text: "Upravljanje vrtićkim grupama.", path: "/groups" },
      { title: "Razvojni profil", text: "Pregled razvojnih profila dece.", path: "/development-profile" },
      { title: "Prisustvo", text: "Pregled i evidencija prisustva.", path: "/attendance" },
      { title: "Dnevni izveštaji", text: "Pregled dnevnih izveštaja.", path: "/daily-reports" },
      { title: "Obaveštenja", text: "Pregled i slanje obaveštenja.", path: "/notifications" },
      { title: "Finansije", text: "Pregled i upravljanje uplatama.", path: "/finance" },
      { title: "Podešavanja", text: "Osnovna sistemska podešavanja.", path: "/system-settings" },
    ],
    Teacher: [
      { title: "Deca", text: "Pregled dece iz dodeljenih grupa.", path: "/children" },
      { title: "Grupe", text: "Pregled dodeljenih grupa.", path: "/groups" },
      { title: "Razvojni profil", text: "Beleške, procene i napredak deteta.", path: "/development-profile" },
      { title: "Prisustvo", text: "Evidencija prisustva dece.", path: "/attendance" },
      { title: "Dnevni izveštaji", text: "Kreiranje i pregled izveštaja.", path: "/daily-reports" },
      { title: "Obaveštenja", text: "Pregled i slanje obaveštenja.", path: "/notifications" },
    ],
    Parent: [
      { title: "Razvojni profil", text: "Pregled razvoja deteta.", path: "/development-profile" },
      { title: "Dnevni izveštaji", text: "Pregled dnevnih aktivnosti.", path: "/daily-reports" },
      { title: "Obaveštenja", text: "Pregled obaveštenja vrtića.", path: "/notifications" },
      { title: "Finansije", text: "Pregled uplata i dugovanja.", path: "/finance" },
    ],
    AdministrativeStaff: [
      { title: "Deca", text: "Administrativni pregled dece.", path: "/children" },
      { title: "Prisustvo", text: "Pregled evidencije prisustva.", path: "/attendance" },
      { title: "Dnevni izveštaji", text: "Pregled dnevnih izveštaja.", path: "/daily-reports" },
      { title: "Obaveštenja", text: "Pregled i slanje obaveštenja.", path: "/notifications" },
      { title: "Finansije", text: "Upravljanje uplatama.", path: "/finance" },
      { title: "Podešavanja", text: "Pregled osnovnih podešavanja.", path: "/system-settings" },
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
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text">{card.text}</p>
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