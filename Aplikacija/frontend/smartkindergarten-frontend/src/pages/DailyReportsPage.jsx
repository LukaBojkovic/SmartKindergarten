/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import dailyReportsApi from "../api/dailyReportsApi";
import groupsApi from "../api/groupsApi";
import DailyReportForm from "../components/dailyReports/DailyReportForm";
import DailyReportsFilters from "../components/dailyReports/DailyReportsFilters";
import DailyReportsList from "../components/dailyReports/DailyReportsList";
import { useAuth } from "../hooks/useAuth";
import { FaSyncAlt } from "react-icons/fa";

const initialForm = {
  groupId: "",
  title: "",
  content: "",
  imageUrl: "",
  reportDate: getTodayDateInputValue(),
};

const MAX_IMAGE_SIZE_BYTES = 500 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function DailyReportsPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);

  const [groupFilter, setGroupFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editingReportId, setEditingReportId] = useState(null);

  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canCreate = user?.role === "Teacher";
  const currentUserId = user?.id ?? user?.userId;

  const canEditReport = (report) => {
    if (user?.role === "Administrator") {
      return true;
    }

    return user?.role === "Teacher" && Number(report.teacherId) === Number(currentUserId);
  };

  const canDeleteReport = canEditReport;

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingGroups(true);

    groupsApi
      .getAll()
      .then((data) => {
        if (!isCancelled) {
          setGroups(data);
          setError("");

          if (data.length > 0 && user?.role === "Teacher") {
            setForm((previousForm) => {
              if (previousForm.groupId) {
                return previousForm;
              }

              return {
                ...previousForm,
                groupId: String(data[0].id),
              };
            });
          }
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingGroups(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingReports(true);

    const request = groupFilter
      ? dailyReportsApi.getByGroup(groupFilter)
      : dailyReportsApi.getAll();

    request
      .then((data) => {
        if (!isCancelled) {
          setReports(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingReports(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [groupFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesDate =
        !dateFilter || toDateInputValue(report.reportDate) === dateFilter;

      const normalizedSearch = searchFilter.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        report.title.toLowerCase().includes(normalizedSearch) ||
        report.content.toLowerCase().includes(normalizedSearch);

      return matchesDate && matchesSearch;
    });
  }, [reports, dateFilter, searchFilter]);

  const loadReports = async () => {
    setIsLoadingReports(true);
    setError("");

    try {
      const data = groupFilter
        ? await dailyReportsApi.getByGroup(groupFilter)
        : await dailyReportsApi.getAll();

      setReports(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleImageChange = async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    setError("Dozvoljeni formati slike su JPG, PNG i WEBP.");
    event.target.value = "";
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    setError("Slika je prevelika. Maksimalna veličina slike je 500 KB.");
    event.target.value = "";
    return;
  }

  try {
    const base64Image = await convertFileToBase64(file);

    setForm((previousForm) => ({
      ...previousForm,
      imageUrl: base64Image,
    }));

    setError("");
  } catch {
    setError("Došlo je do greške pri učitavanju slike.");
  } finally {
    event.target.value = "";
  }
};

const handleClearImage = () => {
  setForm((previousForm) => ({
    ...previousForm,
    imageUrl: "",
  }));

  setTimeout(() => {
    document
      .getElementById("daily-report-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    const reportData = {
      groupId: Number(form.groupId),
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || null,
      reportDate: toUtcIsoDate(form.reportDate),
    };

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingReportId) {
        await dailyReportsApi.update(editingReportId, reportData);

        setSuccessMessage("Dnevni izveštaj je uspešno ažuriran.");
      } else {
        await dailyReportsApi.create(reportData);

        setSuccessMessage("Dnevni izveštaj je uspešno kreiran.");
      }

      resetForm();
      await loadReports();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (report) => {
    setEditingReportId(report.id);

    setForm({
      groupId: String(report.groupId),
      title: report.title,
      content: report.content,
      imageUrl: report.imageUrl || "",
      reportDate: toDateInputValue(report.reportDate),
    });

    setError("");
    setSuccessMessage("");

     setTimeout(() => {
    document
      .getElementById("daily-report-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const deleteReport = async (report) => {
    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš dnevni izveštaj "${report.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await dailyReportsApi.delete(report.id);

      setSuccessMessage("Dnevni izveštaj je obrisan.");
      await loadReports();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const resetForm = () => {
    setEditingReportId(null);

    setForm({
      ...initialForm,
      groupId: groups.length > 0 && user?.role === "Teacher" ? String(groups[0].id) : "",
      reportDate: getTodayDateInputValue(),
    });
  };

  const clearFilters = () => {
    setGroupFilter("");
    setDateFilter("");
    setSearchFilter("");
  };

  const getGroupName = (groupId) => {
    const group = groups.find((item) => item.id === groupId);

    return group ? group.name : `Grupa ${groupId}`;
  };

  const pageDescription =
    user?.role === "Teacher"
      ? "Kreiranje i pregled dnevnih izveštaja za grupe kojima ste dodeljeni."
      : "Pregled dnevnih izveštaja i aktivnosti dece.";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Dnevni izveštaji</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadReports}
          disabled={isLoadingReports}
        >
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {isLoadingGroups && (
        <div className="alert alert-info">Učitavanje grupa...</div>
      )}

      {editingReportId && (
        <div className="alert alert-info">
          U toku je izmena dnevnog izveštaja. Lista izveštaja je privremeno sakrivena
          dok ne sačuvaš ili otkažeš izmenu.
        </div>
      )}

      {(canCreate || editingReportId) && (
        <div id="daily-report-form-section">
          <DailyReportForm
            groups={groups}
            form={form}
            editingReportId={editingReportId}
            isSaving={isSaving}
            canCreate={canCreate}
            canEdit={Boolean(editingReportId)}
            onChange={handleFormChange}
            onImageChange={handleImageChange}
            onClearImage={handleClearImage}
            onSubmit={handleSubmit}
            onCancelEdit={cancelEdit}
          />
        </div>
      )}
      
      {!editingReportId && (
        <>
        <DailyReportsFilters
          groups={groups}
          groupFilter={groupFilter}
          dateFilter={dateFilter}
          searchFilter={searchFilter}
          onGroupFilterChange={setGroupFilter}
          onDateFilterChange={setDateFilter}
          onSearchFilterChange={setSearchFilter}
          onClearFilters={clearFilters}
        />

        <DailyReportsList
          reports={filteredReports}
          isLoading={isLoadingReports}
          getGroupName={getGroupName}
          canEditReport={canEditReport}
          canDeleteReport={canDeleteReport}
          onStartEdit={startEdit}
          onDelete={deleteReport}
        />
      </>
    )}
    </div>
  );
}


function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Greška pri čitanju fajla."));
    };

    reader.readAsDataURL(file);
  });
}

function getTodayDateInputValue() {
  return new Date().toISOString().substring(0, 10);
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return value.substring(0, 10);
}

function toUtcIsoDate(value) {
  if (!value) {
    return null;
  }

  return `${value}T00:00:00Z`;
}

function getErrorMessage(error) {
  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default DailyReportsPage;