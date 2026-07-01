/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import attendanceApi from "../api/attendanceApi";
import groupsApi from "../api/groupsApi";
import AttendanceFilters from "../components/attendance/AttendanceFilters";
import GroupAttendanceTable from "../components/attendance/GroupAttendanceTable";
import { useAuth } from "../hooks/useAuth";
import { FaLock, FaSyncAlt, FaUnlock } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";
import { USER_ROLES } from "../constants/userRoles";
import { getTodayDateInputValue, toUtcIsoDate } from "../utils/dateUtils";

function AttendancePage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [groups, setGroups] = useState([]);
  const [selectedGroupOption, setSelectedGroupOption] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue());

  const [attendance, setAttendance] = useState(null);
  const [lockedAttendanceKeys, setLockedAttendanceKeys] = useState(
    getLockedAttendanceKeys
  );

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [savingChildId, setSavingChildId] = useState(null);

  const [error, setError] = useState("");

  const canManage = user?.role === USER_ROLES.TEACHER;

  const selectedGroupId = selectedGroupOption?.value;
  const attendanceLockKey =
    selectedGroupId && selectedDate ? `${selectedGroupId}:${selectedDate}` : "";
  const isAttendanceLocked = Boolean(
    attendanceLockKey && lockedAttendanceKeys[attendanceLockKey]
  );

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingGroups(true);

    groupsApi
      .getAll()
      .then((data) => {
        if (!isCancelled) {
          setGroups(data);
          setError("");

          setSelectedGroupOption((previousSelectedGroup) => {
            if (
              previousSelectedGroup &&
              data.some((group) => group.id === previousSelectedGroup.value)
            ) {
              return previousSelectedGroup;
            }

            if (data.length === 0) {
              return null;
            }

            const firstGroup = data[0];

            return {
              value: firstGroup.id,
              label: firstGroup.name,
            };
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
          setIsLoadingGroups(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedGroupId || !selectedDate) {
      setAttendance(null);
      return;
    }

    let isCancelled = false;

    setIsLoadingAttendance(true);

    attendanceApi
      .getByGroupAndDate(selectedGroupId, toUtcIsoDate(selectedDate))
      .then((data) => {
        if (!isCancelled) {
          setAttendance(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
          setAttendance(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingAttendance(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedGroupId, selectedDate]);

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  const loadAttendance = async ({ showLoading = true } = {}) => {
    if (!selectedGroupId || !selectedDate) {
      return;
    }

    if (showLoading) {
      setIsLoadingAttendance(true);
    }

    setError("");

    try {
      const data = await attendanceApi.getByGroupAndDate(
        selectedGroupId,
        toUtcIsoDate(selectedDate)
      );

      setAttendance(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setAttendance(null);
    } finally {
      if (showLoading) {
        setIsLoadingAttendance(false);
      }
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleGroupChange = (option) => {
    setSelectedGroupOption(option);
  };

  const toggleAttendanceLock = () => {
    if (!attendanceLockKey) {
      return;
    }

    const nextLockedKeys = { ...lockedAttendanceKeys };

    if (isAttendanceLocked) {
      delete nextLockedKeys[attendanceLockKey];
      setLockedAttendanceKeys(nextLockedKeys);
      saveLockedAttendanceKeys(nextLockedKeys);
      toast.info("Evidencija prisustva je otključana.");
      return;
    }

    nextLockedKeys[attendanceLockKey] = true;
    setLockedAttendanceKeys(nextLockedKeys);
    saveLockedAttendanceKeys(nextLockedKeys);
      toast.info("Evidencija prisustva je zaključana.");
  };

  const handleSaveAttendance = async (child, isPresent) => {
    if (!selectedDate) {
      return;
    }

    if (isAttendanceLocked) {
      toast.info("Evidencija je zaključana. Otključaj je pre izmene.");
      return;
    }

    setSavingChildId(child.childId);
    setError("");

    const attendanceData = {
      childId: child.childId,
      date: toUtcIsoDate(selectedDate),
      isPresent,
    };

    try {
      if (child.isRecorded && child.attendanceId) {
        await attendanceApi.update(child.attendanceId, {
          isPresent,
        });
      } else {
        await attendanceApi.create(attendanceData);
      }

      await loadAttendance({ showLoading: false });
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setSavingChildId(null);
    }
  };

  const handleDeleteAttendance = async (child) => {
    if (!child.attendanceId) {
      return;
    }

    if (isAttendanceLocked) {
      toast.info("Evidencija je zaključana. Otključaj je pre brisanja.");
      return;
    }

    const confirmed = await confirm({
      title: "Brisanje evidencije prisustva",
      message: `Da li sigurno želiš da obrišeš evidenciju prisustva za ${child.childFullName}?`,
      confirmText: "Obriši",
    });

    if (!confirmed) {
      return;
    }

    setSavingChildId(child.childId);
    setError("");

    try {
      await attendanceApi.delete(child.attendanceId);

      toast.success("Evidencija prisustva je obrisana.");
      await loadAttendance();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setSavingChildId(null);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Prisustvo</h1>
          <p className="text-muted mb-0">
            Pregled i evidencija prisustva dece po grupi i datumu.
          </p>
        </div>

        <div className="d-flex gap-2">
          {canManage && selectedGroupId && selectedDate && (
            <button
              className={
                isAttendanceLocked
                  ? "btn btn-warning"
                  : "btn btn-outline-warning"
              }
              type="button"
              onClick={toggleAttendanceLock}
            >
              {isAttendanceLocked ? (
                <FaUnlock className="me-2" />
              ) : (
                <FaLock className="me-2" />
              )}
              {isAttendanceLocked ? "Otključaj" : "Zaključaj"}
            </button>
          )}

          <button
            className="btn btn-outline-primary"
            onClick={loadAttendance}
            disabled={!selectedGroupId || isLoadingAttendance}
          >
            <FaSyncAlt className="me-2" />
            Osveži
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <AttendanceFilters
        groupOptions={groupOptions}
        selectedGroupOption={selectedGroupOption}
        selectedDate={selectedDate}
        isLoadingGroups={isLoadingGroups}
        onGroupChange={handleGroupChange}
        onDateChange={handleDateChange}
      />

      {!selectedGroupId && !isLoadingGroups && (
        <div className="alert alert-info">
          Nema grupa dostupnih za prikaz prisustva.
        </div>
      )}

      <GroupAttendanceTable
        attendance={attendance}
        isLoading={isLoadingAttendance}
        canManage={canManage}
        isLocked={isAttendanceLocked}
        savingChildId={savingChildId}
        onSaveAttendance={handleSaveAttendance}
        onDeleteAttendance={handleDeleteAttendance}
      />
    </div>
  );
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

function getLockedAttendanceKeys() {
  try {
    return JSON.parse(localStorage.getItem("lockedAttendanceKeys") || "{}");
  } catch {
    return {};
  }
}

function saveLockedAttendanceKeys(lockedAttendanceKeys) {
  localStorage.setItem(
    "lockedAttendanceKeys",
    JSON.stringify(lockedAttendanceKeys)
  );
}

export default AttendancePage;
