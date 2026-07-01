/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import childrenApi from "../api/childrenApi";
import notificationsApi from "../api/notificationsApi";
import usersApi from "../api/usersApi";
import NotificationForm from "../components/notifications/NotificationForm";
import NotificationsFilters from "../components/notifications/NotificationsFilters";
import NotificationsList from "../components/notifications/NotificationsList";
import PaginationControls from "../components/common/PaginationControls";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";
import { USER_ROLES } from "../constants/userRoles";
import { getTotalPages, paginateItems } from "../utils/paginationUtils";

const initialForm = {
  title: "",
  content: "",
};

const PAGE_SIZE = 10;

function NotificationsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [notifications, setNotifications] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [recipientChildren, setRecipientChildren] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [recipientGroupFilter, setRecipientGroupFilter] = useState("");
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [isNotificationFormVisible, setIsNotificationFormVisible] =
  useState(false);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const currentUserId = getCurrentUserId(user);
  const isAdmin = user?.role === USER_ROLES.ADMINISTRATOR;
  const isTeacher = user?.role === USER_ROLES.TEACHER;
  const canSend =
    user?.role === USER_ROLES.ADMINISTRATOR ||
    user?.role === USER_ROLES.TEACHER ||
    user?.role === USER_ROLES.ADMINISTRATIVE_STAFF;

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingNotifications(true);

    const request = isAdmin ? notificationsApi.getAll() : notificationsApi.getMy();

    request
      .then((data) => {
        if (!isCancelled) {
          setNotifications(data);
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
          setIsLoadingNotifications(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
  if (!canSend) {
    return;
  }

  let isCancelled = false;

  setIsLoadingRecipients(true);

  const isAdministrator = user?.role === USER_ROLES.ADMINISTRATOR;

  const request = isAdministrator
    ? loadAdminRecipientOptions(currentUserId)
    : loadParentRecipientData();

  request
    .then((recipientData) => {
      if (!isCancelled) {
        if (isAdministrator) {
          setRecipientOptions(recipientData);
          setRecipientChildren([]);
          return;
        }

        setRecipientOptions(recipientData.options);
        setRecipientChildren(recipientData.children);
      }
    })
    .catch((requestError) => {
      if (!isCancelled) {
        setError(getErrorMessage(requestError));
      }
    })
    .finally(() => {
      if (!isCancelled) {
        setIsLoadingRecipients(false);
      }
    });

  return () => {
    isCancelled = true;
  };
}, [canSend, user?.role, currentUserId]);

  const recipientGroupOptions = useMemo(() => {
    if (!isTeacher) {
      return [];
    }

    return getRecipientGroupOptions(recipientChildren);
  }, [isTeacher, recipientChildren]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const normalizedSearch = searchFilter.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.content.toLowerCase().includes(normalizedSearch) ||
        notification.senderFullName.toLowerCase().includes(normalizedSearch);

      const myRecipient = notification.recipients.find(
        (recipient) => Number(recipient.userId) === Number(currentUserId)
      );

      const matchesUnread =
        isAdmin || !unreadOnly || (myRecipient && !myRecipient.isRead);

      return matchesSearch && matchesUnread;
    });
  }, [notifications, searchFilter, unreadOnly, currentUserId, isAdmin]);

  const totalPages = getTotalPages(filteredNotifications.length, PAGE_SIZE);
  const paginatedNotifications = paginateItems(
    filteredNotifications,
    currentPage,
    PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [unreadOnly, searchFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isTeacher || editingNotificationId) {
      return;
    }

    setSelectedRecipients(
      getParentRecipientOptions(recipientChildren, recipientGroupFilter)
    );
  }, [editingNotificationId, isTeacher, recipientChildren, recipientGroupFilter]);

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    setError("");

    try {
      const data = isAdmin
        ? await notificationsApi.getAll()
        : await notificationsApi.getMy();

      setNotifications(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const openCreateNotificationForm = () => {
  setEditingNotificationId(null);
  setForm(initialForm);
  setRecipientGroupFilter("");
  setSelectedRecipients(
    isTeacher ? getParentRecipientOptions(recipientChildren, "") : []
  );

  setIsNotificationFormVisible(true);
  setError("");

  setTimeout(() => {
    document
      .getElementById("notification-form-section")
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setError("");

    try {
      if (editingNotificationId) {
        await notificationsApi.create({
          title: form.title,
          content: form.content,
          recipientUserIds: selectedRecipients.map(
            (recipient) => recipient.value
          ),
        });

        await notificationsApi.delete(editingNotificationId);

        toast.success("Obaveštenje je izmenjeno i ponovo poslato primaocima.");
      } else {
        await notificationsApi.create({
          title: form.title,
          content: form.content,
          recipientUserIds: selectedRecipients.map(
            (recipient) => recipient.value
          ),
        });
        toast.success("Obaveštenje je uspešno poslato.");
      }

      resetForm();
      setIsNotificationFormVisible(false);
      await loadNotifications();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (notification) => {
    setEditingNotificationId(notification.id);

    setForm({
      title: notification.title,
      content: notification.content,
    });

    setSelectedRecipients(
      notification.recipients.map((recipient) => ({
        value: recipient.userId,
        label: recipient.recipientFullName,
      }))
    );

    setIsNotificationFormVisible(true);
    setError("");

    setTimeout(() => {
    document
      .getElementById("notification-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
  };

  const cancelEdit = () => {
    resetForm();
    setIsNotificationFormVisible(false);
  };

  const markAsRead = async (notification) => {
    setError("");

    try {
      await notificationsApi.markAsRead(notification.id);

      toast.success("Obaveštenje je označeno kao pročitano.");
      await loadNotifications();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  const deleteNotification = async (notification) => {
    const confirmed = await confirm({
      title: "Brisanje obaveštenja",
      message: `Da li sigurno želiš da obrišeš obaveštenje "${notification.title}"?`,
      confirmText: "Obriši",
    });

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await notificationsApi.delete(notification.id);

      toast.success("Obaveštenje je obrisano.");
      await loadNotifications();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  const resetForm = () => {
    setEditingNotificationId(null);
    setForm(initialForm);
    setRecipientGroupFilter("");
    setSelectedRecipients([]);
  };

  const clearFilters = () => {
    setUnreadOnly(false);
    setSearchFilter("");
  };

  const pageDescription = canSend
    ? "Primljena obaveštenja i poruke koje šaljete korisnicima."
    : "Pregled obaveštenja koja su vam poslata.";

    const selectAllRecipients = () => {
    setSelectedRecipients(recipientOptions);
  };

  const clearRecipients = () => {
    setSelectedRecipients([]);
  };
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Obaveštenja</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <div className="d-flex gap-2">
          {canSend && (
            <button
              className="btn btn-primary"
              onClick={openCreateNotificationForm}
            >
              <FaPlus className="me-2" />
              Novo obaveštenje
            </button>
          )}

          <button
            className="btn btn-outline-primary"
            onClick={loadNotifications}
            disabled={isLoadingNotifications}
          >
            <FaSyncAlt className="me-2" />
            Osveži
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

     {canSend && isNotificationFormVisible && (
        <div id="notification-form-section">
          {isLoadingRecipients && (
            <div className="alert alert-info">Učitavanje primalaca...</div>
          )}

          <NotificationForm
            form={form}
            selectedRecipients={selectedRecipients}
            recipientOptions={recipientOptions}
            recipientGroupOptions={recipientGroupOptions}
            recipientGroupFilter={recipientGroupFilter}
            editingNotificationId={editingNotificationId}
            isSaving={isSaving}
            onChange={handleFormChange}
            onRecipientsChange={setSelectedRecipients}
            onRecipientGroupFilterChange={setRecipientGroupFilter}
            onSelectAllRecipients={selectAllRecipients}
            onClearRecipients={clearRecipients}
            onSubmit={handleSubmit}
            onCancelEdit={cancelEdit}
          />
        </div>
      )}

      <NotificationsFilters
        isAdmin={isAdmin}
        unreadOnly={unreadOnly}
        searchFilter={searchFilter}
        onUnreadOnlyChange={setUnreadOnly}
        onSearchFilterChange={setSearchFilter}
        onClearFilters={clearFilters}
      />

      <NotificationsList
        notifications={paginatedNotifications}
        isLoading={isLoadingNotifications}
        currentUserId={currentUserId}
        userRole={user?.role}
        onMarkAsRead={markAsRead}
        onStartEdit={startEdit}
        onDelete={deleteNotification}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

async function loadAdminRecipientOptions(currentUserId) {
  const users = await usersApi.getAll({
    role: "",
    isActive: "true",
  });

  return users
    .filter((user) => Number(user.id) !== Number(currentUserId))
    .map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - ${user.role}`,
    }));
}

async function loadParentRecipientData() {
  const children = await childrenApi.getAll({
    search: "",
    groupId: "",
    isActive: "true",
  });

  return {
    children,
    options: getParentRecipientOptions(children, ""),
  };
}

function getRecipientGroupOptions(children) {
  const groupMap = new Map();

  children.forEach((child) => {
    if (!child.groupId) {
      return;
    }

    groupMap.set(String(child.groupId), child.groupName || `Grupa ${child.groupId}`);
  });

  return Array.from(groupMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));
}

function getParentRecipientOptions(children, groupId) {
  const parentMap = new Map();

  children
    .filter((child) => !groupId || String(child.groupId) === String(groupId))
    .forEach((child) => {
    child.parents.forEach((parent) => {
      const parentId = parent.id ?? parent.parentId;
      const childLabel = `${child.firstName} ${child.lastName}`;
      const groupLabel = child.groupName || "bez grupe";

      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, {
          value: parentId,
          fullName: parent.fullName,
          email: parent.email,
          children: [{ childLabel, groupLabel }],
        });
        return;
      }

      parentMap.get(parentId).children.push({ childLabel, groupLabel });
    });
  });

  return Array.from(parentMap.values()).map((parent) => ({
    value: parent.value,
    label: getParentRecipientLabel(parent),
  }));
}

function getParentRecipientLabel(parent) {
  if (parent.children.length === 1) {
    const child = parent.children[0];

    return `${parent.fullName} - roditelj: ${child.childLabel}, ${child.groupLabel}`;
  }

  return parent.email ? `${parent.fullName} - ${parent.email}` : parent.fullName;
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

export default NotificationsPage;
