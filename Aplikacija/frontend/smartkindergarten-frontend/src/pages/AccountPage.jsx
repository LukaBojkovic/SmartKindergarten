import { useState } from "react";
import {
  FaEnvelope,
  FaIdBadge,
  FaKey,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";
import authApi from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AccountPage()
 {
  const { user } = useAuth();
  const fullName = getFullName(user);
  const userInitials = getUserInitials(user);

  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

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
      setError("");
      toast.error("Nova lozinka i potvrda lozinke se ne poklapaju.");
      return;
    }

    setIsSaving(true);
    setError("");

    try 
    {
      const responseMessage = await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success(responseMessage || "Lozinka je uspešno promenjena.");
      setForm(initialForm);
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
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

      <div className="row g-4 align-items-start">
        <div className="col-lg-4">
          <div className="card shadow-sm account-profile-card">
            <div className="card-body">
              <div className="text-center">
                <div className="account-avatar mx-auto">
                  {userInitials}
                </div>

                <h5 className="account-profile-name">{fullName}</h5>

                {user?.role && (
                  <span className="badge bg-success">{user.role}</span>
                )}
              </div>

              <div className="account-detail-list">
                <div className="account-detail-item">
                  <span className="account-detail-icon">
                    <FaUser />
                  </span>

                  <div>
                    <span className="account-detail-label">
                      Korisničko ime
                    </span>
                    <strong>{user?.username || "-"}</strong>
                  </div>
                </div>

                <div className="account-detail-item">
                  <span className="account-detail-icon">
                    <FaIdBadge />
                  </span>

                  <div>
                    <span className="account-detail-label">Uloga</span>
                    <strong>{user?.role || "-"}</strong>
                  </div>
                </div>

                {user?.email && (
                  <div className="account-detail-item">
                    <span className="account-detail-icon">
                      <FaEnvelope />
                    </span>

                    <div>
                      <span className="account-detail-label">Email</span>
                      <strong>{user.email}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
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

              <div className="alert alert-secondary d-flex align-items-center gap-2 mt-3 mb-0">
                <FaShieldAlt />
                <span>
                  Lozinku čuvajte poverljivo i ne delite je sa drugim korisnicima.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFullName(user) {
  const fullName = user?.fullName?.trim();

  if (fullName)
    return fullName;

  const nameParts = [user?.firstName, user?.lastName].filter(Boolean);

  if (nameParts.length > 0)
    return nameParts.join(" ");

  return user?.username || "Korisnik";
}

function getUserInitials(user) {
  const fullName = getFullName(user);
  const nameParts = fullName.split(" ").filter(Boolean);

  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }

  return fullName.slice(0, 2).toUpperCase();
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
