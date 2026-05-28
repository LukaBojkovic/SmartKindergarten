import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginPage() 
{
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
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
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-4">
          <h2 className="mb-2 text-center">SmartKindergarten</h2>
          <p className="text-muted text-center mb-4">
            Prijava na sistem
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
                placeholder="admin"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Lozinka</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="admin123"
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

          <div className="mt-4 small text-muted">
            Demo nalozi:
            <ul className="mb-0">
              <li>admin / admin123</li>
              <li>teacher / teacher123</li>
              <li>parent / parent123</li>
              <li>staff / staff123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;