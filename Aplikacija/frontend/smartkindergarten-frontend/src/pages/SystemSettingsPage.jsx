/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import systemSettingsApi from "../api/systemSettingsApi";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { SYSTEM_SETTING_KEYS } from "../constants/systemSettingKeys";
import { USER_ROLES } from "../constants/userRoles";

function SystemSettingsPage() {
  const { user } = useAuth();

  const [monthlyFeeSettingId, setMonthlyFeeSettingId] = useState(null);
  const [kindergartenNameSettingId, setKindergartenNameSettingId] =
    useState(null);

  const [monthlyFee, setMonthlyFee] = useState("");
  const [kindergartenName, setKindergartenName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const canManage = user?.role === USER_ROLES.ADMINISTRATOR;

  const loadSettings = async () => {
    setIsLoading(true);
    setError("");

    try {
      await Promise.all([loadMonthlyFee(), loadKindergartenName()]);
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMonthlyFee = async () => {
    try {
      const setting = await systemSettingsApi.getByKey(
        SYSTEM_SETTING_KEYS.MONTHLY_FEE
      );

      setMonthlyFeeSettingId(setting.id);
      setMonthlyFee(setting.value);
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setMonthlyFeeSettingId(null);
        setMonthlyFee("");
      } else {
        setError(getErrorMessage(requestError));
      }
    }
  };

  const loadKindergartenName = async () => {
    try {
      const setting = await systemSettingsApi.getByKey(
        SYSTEM_SETTING_KEYS.KINDERGARTEN_NAME
      );

      setKindergartenNameSettingId(setting.id);
      setKindergartenName(setting.value);
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setKindergartenNameSettingId(null);
        setKindergartenName("");
      } else {
        setError(getErrorMessage(requestError));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    const trimmedKindergartenName = kindergartenName.trim();
    const parsedMonthlyFee = Number(monthlyFee);

    if (!trimmedKindergartenName) {
      setError("");
      toast.error("Naziv ustanove je obavezan.");
      return;
    }

    if (Number.isNaN(parsedMonthlyFee) || parsedMonthlyFee <= 0) {
      setError("");
      toast.error("Mesečna članarina mora biti pozitivan broj.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedKindergartenName = await saveSetting({
        id: kindergartenNameSettingId,
        key: SYSTEM_SETTING_KEYS.KINDERGARTEN_NAME,
        value: trimmedKindergartenName,
        description: "Naziv predškolske ustanove koji se prikazuje u aplikaciji.",
      });

      const savedMonthlyFee = await saveSetting({
        id: monthlyFeeSettingId,
        key: SYSTEM_SETTING_KEYS.MONTHLY_FEE,
        value: String(parsedMonthlyFee),
        description: "Iznos mesečne članarine po detetu.",
      });

      setKindergartenNameSettingId(savedKindergartenName.id);
      setKindergartenName(savedKindergartenName.value);

      setMonthlyFeeSettingId(savedMonthlyFee.id);
      setMonthlyFee(savedMonthlyFee.value);

      toast.success("Sistemska podešavanja su uspešno sačuvana.");
      window.dispatchEvent(new Event("system-settings:updated"));
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const saveSetting = async ({ id, key, value, description }) => {
    const settingData = {
      key,
      value,
      description,
    };

    if (id) {
      return await systemSettingsApi.update(id, settingData);
    }

    return await systemSettingsApi.create(settingData);
  };

  const pageDescription = canManage
    ? "Podešavanje osnovnih vrednosti koje se koriste u aplikaciji."
    : "Pregled osnovnih podešavanja aplikacije.";

  return (
    <div className="container mt-4 system-settings-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Sistemska podešavanja</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadSettings}
          disabled={isLoading}
        >
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoading ? (
        <div className="alert alert-info">
          Učitavanje sistemskih podešavanja...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Opšta podešavanja</h5>

              <div className="mb-3">
                <label className="form-label">Naziv ustanove</label>

                <input
                  className="form-control"
                  value={kindergartenName}
                  onChange={(event) => setKindergartenName(event.target.value)}
                  placeholder="Npr. Predškolska ustanova Sunce"
                  disabled={!canManage}
                  required
                />

                <div className="form-text">
                  Naziv ustanove se prikazuje u aplikaciji, npr. u navigaciji.
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Finansijska podešavanja</h5>

              <div className="mb-3">
                <label className="form-label">Mesečna članarina</label>

                <div className="input-group">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-control"
                    value={monthlyFee}
                    onChange={(event) => setMonthlyFee(event.target.value)}
                    disabled={!canManage}
                    required
                  />

                  <span className="input-group-text">RSD</span>
                </div>

                <div className="form-text">
                  Na Finance stranici očekivana obaveza se računa kao mesečna
                  članarina × broj meseci.
                </div>
              </div>
            </div>
          </div>

          {!canManage && (
            <div className="alert alert-secondary">
              Izmena sistemskih podešavanja dostupna je samo administratoru.
            </div>
          )}

          {canManage && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              <FaSave className="me-2" />
              {isSaving ? "Čuvanje..." : "Sačuvaj podešavanja"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Niste prijavljeni ili je sesija istekla. Prijavite se ponovo.";
  }

  if (error.response?.status === 403) {
    return "Nemate dozvolu za ovu akciju.";
  }

  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default SystemSettingsPage;
