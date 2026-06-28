import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FaChild, FaClipboardList, FaLock, FaUsers } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch {
      setError("Neispravno korisničko ime ili lozinka.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        <div className="row g-4 align-items-stretch justify-content-center">
          <div className="col-lg-6">
            <div className="login-info-panel h-100">
              <div className="login-brand-icon">
                <FaChild />
              </div>

              <h1>SmartKindergarten</h1>
              <p>
                Jedinstven prostor za administraciju vrtića, rad sa grupama,
                dnevne izveštaje, obaveštenja i finansijski pregled.
              </p>

              <div className="login-feature-list">
                <div className="login-feature-item">
                  <FaUsers />
                  <span>Pregledan rad za zaposlene i roditelje</span>
                </div>

                <div className="login-feature-item">
                  <FaClipboardList />
                  <span>Pregled aktivnosti, prisustva i izveštaja</span>
                </div>

                <div className="login-feature-item">
                  <FaLock />
                  <span>Sigurna prijava za zaposlene i roditelje</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-10 col-md-8 col-lg-5">
            <div className="card shadow-sm login-card h-100">
              <div className="card-body p-4 p-md-5">
                <h2 className="mb-2 text-center">Prijava</h2>
                <p className="text-muted text-center mb-4">
                  Unesite pristupne podatke za SmartKindergarten.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Korisničko ime</label>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Unesite korisničko ime"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Lozinka</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Unesite lozinku"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
