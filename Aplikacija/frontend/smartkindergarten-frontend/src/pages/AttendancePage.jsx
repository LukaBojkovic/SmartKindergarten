/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import attendanceApi from "../api/attendanceApi";
import groupsApi from "../api/groupsApi";
import AttendanceFilters from "../components/attendance/AttendanceFilters";
import GroupAttendanceTable from "../components/attendance/GroupAttendanceTable";
import { useAuth } from "../hooks/useAuth";
import { FaSyncAlt } from "react-icons/fa";

function AttendancePage() {
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [selectedGroupOption, setSelectedGroupOption] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue());

  const [attendance, setAttendance] = useState(null);

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [savingChildId, setSavingChildId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canManage =
    user?.role === "Administrator" || user?.role === "Teacher";

  const selectedGroupId = selectedGroupOption?.value;

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

  const loadAttendance = async () => {
    if (!selectedGroupId || !selectedDate) {
      return;
    }

    setIsLoadingAttendance(true);
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
      setIsLoadingAttendance(false);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSuccessMessage("");
  };

  const handleGroupChange = (option) => {
    setSelectedGroupOption(option);
    setSuccessMessage("");
  };

  const handleSaveAttendance = async (child, isPresent) => {
    if (!selectedDate) {
      return;
    }

    setSavingChildId(child.childId);
    setError("");
    setSuccessMessage("");

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

        setSuccessMessage("Prisustvo je uspešno ažurirano.");
      } else {
        await attendanceApi.create(attendanceData);

        setSuccessMessage("Prisustvo je uspešno evidentirano.");
      }

      await loadAttendance();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingChildId(null);
    }
  };

  const handleDeleteAttendance = async (child) => {
    if (!child.attendanceId) {
      return;
    }

    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš evidenciju prisustva za ${child.childFullName}?`
    );

    if (!confirmed) {
      return;
    }

    setSavingChildId(child.childId);
    setError("");
    setSuccessMessage("");

    try {
      await attendanceApi.delete(child.attendanceId);

      setSuccessMessage("Evidencija prisustva je obrisana.");
      await loadAttendance();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
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

        <button
          className="btn btn-outline-primary"
          onClick={loadAttendance}
          disabled={!selectedGroupId || isLoadingAttendance}
        >
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

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
        savingChildId={savingChildId}
        onSaveAttendance={handleSaveAttendance}
        onDeleteAttendance={handleDeleteAttendance}
      />
    </div>
  );
}

function getTodayDateInputValue() {
  return new Date().toISOString().substring(0, 10);
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

export default AttendancePage;