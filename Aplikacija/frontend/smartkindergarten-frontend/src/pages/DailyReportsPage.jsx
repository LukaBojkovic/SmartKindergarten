/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import dailyReportsApi from "../api/dailyReportsApi";
import groupsApi from "../api/groupsApi";
import DailyReportForm from "../components/dailyReports/DailyReportForm";
import DailyReportsFilters from "../components/dailyReports/DailyReportsFilters";
import DailyReportsList from "../components/dailyReports/DailyReportsList";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  groupId: "",
  title: "",
  content: "",
  imageUrl: "",
  reportDate: getTodayDateInputValue(),
};

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

    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {(canCreate || editingReportId) && (
        <DailyReportForm
          groups={groups}
          form={form}
          editingReportId={editingReportId}
          isSaving={isSaving}
          canCreate={canCreate}
          canEdit={Boolean(editingReportId)}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancelEdit={cancelEdit}
        />
      )}

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
    </div>
  );
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