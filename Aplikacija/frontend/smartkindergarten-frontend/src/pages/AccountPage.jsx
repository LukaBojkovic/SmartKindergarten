import { useState } from "react";
import { FaKey } from "react-icons/fa";
import authApi from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AccountPage()
 {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword)
    {
      setError("Nova lozinka i potvrda lozinke se ne poklapaju.");
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try 
    {
      const responseMessage = await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccessMessage(responseMessage || "Lozinka je uspešno promenjena.");
      setForm(initialForm);
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Moj nalog</h1>
      <p className="text-muted">
        Pregled osnovnih podataka i promena lozinke.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Podaci o korisniku</h5>

              <p className="mb-1">
                <strong>Ime i prezime:</strong> {user?.fullName}
              </p>

              <p className="mb-1">
                <strong>Korisničko ime:</strong> {user?.username}
              </p>

              <p className="mb-0">
                <strong>Uloga:</strong> {user?.role}
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Promena lozinke</h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Trenutna lozinka</label>
                  <input
                    name="currentPassword"
                    type="password"
                    className="form-control"
                    value={form.currentPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nova lozinka</label>
                  <input
                    name="newPassword"
                    type="password"
                    className="form-control"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />

                  <div className="form-text">
                    Nova lozinka mora imati najmanje 6 karaktera.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Potvrda nove lozinke</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="form-control"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  <FaKey className="me-2" />
                  {isSaving ? "Čuvanje..." : "Promeni lozinku"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error) 
{
  if (typeof error.response?.data === "string")
    return error.response.data;

  if (error.response?.data?.message)
    return error.response.data.message;

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default AccountPage;
