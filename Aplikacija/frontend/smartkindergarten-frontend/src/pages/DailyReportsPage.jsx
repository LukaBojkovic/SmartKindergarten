/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import childrenApi from "../api/childrenApi";
import dailyReportsApi from "../api/dailyReportsApi";
import groupsApi from "../api/groupsApi";
import DailyReportForm from "../components/dailyReports/DailyReportForm";
import DailyReportsFilters from "../components/dailyReports/DailyReportsFilters";
import DailyReportsList from "../components/dailyReports/DailyReportsList";
import PaginationControls from "../components/common/PaginationControls";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";
import { USER_ROLES } from "../constants/userRoles";
import {
  getTodayDateInputValue,
  toDateInputValue,
  toUtcIsoDate,
} from "../utils/dateUtils";
import { getTotalPages, paginateItems } from "../utils/paginationUtils";

const initialForm = {
  groupId: "",
  title: "",
  content: "",
  imageUrl: "",
  reportDate: getTodayDateInputValue(),
};

const MAX_IMAGE_SIZE_BYTES = 500 * 1024;
const PAGE_SIZE = 10;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function DailyReportsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [childrenList, setChildrenList] = useState([]);

  const [groupFilter, setGroupFilter] = useState("");
  const [childFilter, setChildFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState(initialForm);
  const [editingReportId, setEditingReportId] = useState(null);
  const [isReportFormVisible, setIsReportFormVisible] = useState(false);

  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const canCreate = user?.role === USER_ROLES.TEACHER;
  const currentUserId = getCurrentUserId(user);
  const isParent = user?.role === USER_ROLES.PARENT;
  const selectedChild = childrenList.find(
    (child) => String(child.id) === String(childFilter)
  );
  const selectedChildGroupId = selectedChild?.groupId;
  const selectedChildHasNoGroup = isParent && selectedChild && !selectedChildGroupId;

  const canEditReport = (report) =>
    user?.role === USER_ROLES.TEACHER &&
    Number(report.teacherId) === Number(currentUserId);

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

          if (data.length > 0 && user?.role === USER_ROLES.TEACHER) {
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
    if (!isParent) {
      setChildrenList([]);
      setChildFilter("");
      setIsLoadingChildren(false);
      return;
    }

    let isCancelled = false;

    setIsLoadingChildren(true);

    childrenApi
      .getAll({
        search: "",
        groupId: "",
        isActive: "true",
      })
      .then((data) => {
        if (!isCancelled) {
          setChildrenList(data);
          setError("");

          setChildFilter((previousChildId) => {
            if (
              previousChildId &&
              data.some((child) => String(child.id) === String(previousChildId))
            ) {
              return previousChildId;
            }

            return data.length === 1 ? String(data[0].id) : "";
          });
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingChildren(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isParent]);

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingReports(true);

    const request = getReportsRequest({
      isParent,
      selectedChildGroupId,
      selectedChildHasNoGroup,
      groupFilter,
    });

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
  }, [groupFilter, isParent, selectedChildGroupId, selectedChildHasNoGroup]);

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

  const totalPages = getTotalPages(filteredReports.length, PAGE_SIZE);
  const paginatedReports = paginateItems(
    filteredReports,
    currentPage,
    PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [groupFilter, childFilter, dateFilter, searchFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const loadReports = async () => {
    setIsLoadingReports(true);
    setError("");

    try {
      const data = await getReportsRequest({
        isParent,
        selectedChildGroupId,
        selectedChildHasNoGroup,
        groupFilter,
      });

      setReports(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingReports(false);
    }
  };

  const openCreateReportForm = () => {
    setEditingReportId(null);

    setForm({
      ...initialForm,
      groupId: groups.length > 0 && user?.role === USER_ROLES.TEACHER ? String(groups[0].id) : "",
      reportDate: getTodayDateInputValue(),
    });

    setIsReportFormVisible(true);
    setError("");

    setTimeout(() => {
      document
        .getElementById("daily-report-form-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
    setError("");
    toast.error("Dozvoljeni formati slike su JPG, PNG i WEBP.");
    event.target.value = "";
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    setError("");
    toast.error("Slika je prevelika. Maksimalna veličina slike je 500 KB.");
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
    setError("");
    toast.error("Došlo je do greške pri učitavanju slike.");
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

    try {
      if (editingReportId) {
        await dailyReportsApi.update(editingReportId, reportData);

        toast.success("Dnevni izveštaj je uspešno ažuriran.");
      } else {
        await dailyReportsApi.create(reportData);

        toast.success("Dnevni izveštaj je uspešno kreiran.");
      }

      resetForm();
      setIsReportFormVisible(false);
      await loadReports();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (report) => {
    if (!canEditReport(report)) {
      return;
    }

    setEditingReportId(report.id);

    setForm({
      groupId: String(report.groupId),
      title: report.title,
      content: report.content,
      imageUrl: report.imageUrl || "",
      reportDate: toDateInputValue(report.reportDate),
    });

    setIsReportFormVisible(true);
    setError("");

     setTimeout(() => {
    document
      .getElementById("daily-report-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
  };

  const cancelEdit = () => {
    resetForm();
    setIsReportFormVisible(false);
  };

  const deleteReport = async (report) => {
    if (!canDeleteReport(report)) {
      return;
    }

    const confirmed = await confirm({
      title: "Brisanje dnevnog izveštaja",
      message: `Da li sigurno želiš da obrišeš dnevni izveštaj "${report.title}"?`,
      confirmText: "Obriši",
    });

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await dailyReportsApi.delete(report.id);

      toast.success("Dnevni izveštaj je obrisan.");
      await loadReports();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  const resetForm = () => {
    setEditingReportId(null);

    setForm({
      ...initialForm,
      groupId: groups.length > 0 && user?.role === USER_ROLES.TEACHER ? String(groups[0].id) : "",
      reportDate: getTodayDateInputValue(),
    });
  };

  const clearFilters = () => {
    setGroupFilter("");
    setChildFilter(childrenList.length === 1 ? String(childrenList[0].id) : "");
    setDateFilter("");
    setSearchFilter("");
  };

  const getGroupName = (groupId) => {
    const group = groups.find((item) => item.id === groupId);

    return group ? group.name : `Grupa ${groupId}`;
  };

  const pageDescription =
    user?.role === USER_ROLES.TEACHER
      ? "Dnevni izveštaji i aktivnosti za vaše grupe."
      : "Pregled dnevnih izveštaja i aktivnosti dece.";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Dnevni izveštaji</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <div className="d-flex gap-2">
          {canCreate && (
            <button
              className="btn btn-primary"
              onClick={openCreateReportForm}
              disabled={isLoadingGroups || groups.length === 0}
            >
              <FaPlus className="me-2" />
              Dodaj izveštaj
            </button>
          )}

        <button
          className="btn btn-outline-primary"
          onClick={loadReports}
          disabled={isLoadingReports}
        >
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoadingGroups && !isParent && (
        <div className="alert alert-info">Učitavanje grupa...</div>
      )}

      {isLoadingChildren && (
        <div className="alert alert-info">Učitavanje dece...</div>
      )}

      {editingReportId && isReportFormVisible && (
        <div className="alert alert-info">
          U toku je izmena dnevnog izveštaja. Lista izveštaja je privremeno sakrivena
          dok ne sačuvaš ili otkažeš izmenu.
        </div>
      )}

      {isReportFormVisible && (canCreate || editingReportId) && (
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
      
      {!isReportFormVisible && (
        <>
        <DailyReportsFilters
          groups={groups}
          childrenList={childrenList}
          isParent={isParent}
          groupFilter={groupFilter}
          childFilter={childFilter}
          dateFilter={dateFilter}
          searchFilter={searchFilter}
          onGroupFilterChange={setGroupFilter}
          onChildFilterChange={setChildFilter}
          onDateFilterChange={setDateFilter}
          onSearchFilterChange={setSearchFilter}
          onClearFilters={clearFilters}
        />

        {selectedChildHasNoGroup && (
          <div className="alert alert-info">
            Za izabrano dete nema dostupnih dnevnih izveštaja jer nije dodeljeno grupi.
          </div>
        )}

        <DailyReportsList
          reports={paginatedReports}
          isLoading={isLoadingReports}
          getGroupName={getGroupName}
          canEditReport={canEditReport}
          canDeleteReport={canDeleteReport}
          onStartEdit={startEdit}
          onDelete={deleteReport}
        />

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
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

function getReportsRequest({
  isParent,
  selectedChildGroupId,
  selectedChildHasNoGroup,
  groupFilter,
}) {
  if (isParent) {
    if (!selectedChildGroupId || selectedChildHasNoGroup) {
      return Promise.resolve([]);
    }

    return dailyReportsApi.getByGroup(selectedChildGroupId);
  }

  return groupFilter
    ? dailyReportsApi.getByGroup(groupFilter)
    : dailyReportsApi.getAll();
}

function getCurrentUserId(user) {
  return user?.id ?? user?.userId ?? user?.userID ?? null;
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
