/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import childrenApi from "../api/childrenApi";
import notificationsApi from "../api/notificationsApi";
import usersApi from "../api/usersApi";
import NotificationForm from "../components/notifications/NotificationForm";
import NotificationsFilters from "../components/notifications/NotificationsFilters";
import NotificationsList from "../components/notifications/NotificationsList";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";

const initialForm = {
  title: "",
  content: "",
};

function NotificationsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [notifications, setNotifications] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [isNotificationFormVisible, setIsNotificationFormVisible] =
  useState(false);

  const [scope, setScope] = useState(
    user?.role === "Administrator" ? "all" : "my"
  );
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const currentUserId = getCurrentUserId(user);
  const isAdmin = user?.role === "Administrator";
  const canSend =
    user?.role === "Administrator" ||
    user?.role === "Teacher" ||
    user?.role === "AdministrativeStaff";

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingNotifications(true);

    const request =
      isAdmin && scope === "all"
        ? notificationsApi.getAll()
        : notificationsApi.getMy();

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
  }, [isAdmin, scope]);

  useEffect(() => {
  if (!canSend) {
    return;
  }

  let isCancelled = false;

  setIsLoadingRecipients(true);

  const isAdministrator = user?.role === "Administrator";

  const request = isAdministrator
    ? loadAdminRecipientOptions(currentUserId)
    : loadParentRecipientOptions();

  request
    .then((options) => {
      if (!isCancelled) {
        setRecipientOptions(options);
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

      const matchesUnread = !unreadOnly || (myRecipient && !myRecipient.isRead);

      return matchesSearch && matchesUnread;
    });
  }, [notifications, searchFilter, unreadOnly, currentUserId]);

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    setError("");

    try {
      const data =
        isAdmin && scope === "all"
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
  setSelectedRecipients([]);

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
        await notificationsApi.update(editingNotificationId, {
          title: form.title,
          content: form.content,
        });

        toast.success("Obaveštenje je uspešno izmenjeno.");
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
    setSelectedRecipients([]);
  };

  const clearFilters = () => {
    setUnreadOnly(false);
    setSearchFilter("");

    if (isAdmin) {
      setScope("all");
    }
  };

  const pageDescription = canSend
    ? "Pregled primljenih obaveštenja i slanje novih obaveštenja korisnicima."
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
            editingNotificationId={editingNotificationId}
            isSaving={isSaving}
            onChange={handleFormChange}
            onRecipientsChange={setSelectedRecipients}
            onSelectAllRecipients={selectAllRecipients}
            onClearRecipients={clearRecipients}
            onSubmit={handleSubmit}
            onCancelEdit={cancelEdit}
          />
        </div>
      )}

      <NotificationsFilters
        isAdmin={isAdmin}
        scope={scope}
        unreadOnly={unreadOnly}
        searchFilter={searchFilter}
        onScopeChange={setScope}
        onUnreadOnlyChange={setUnreadOnly}
        onSearchFilterChange={setSearchFilter}
        onClearFilters={clearFilters}
      />

      <NotificationsList
        notifications={filteredNotifications}
        isLoading={isLoadingNotifications}
        currentUserId={currentUserId}
        userRole={user?.role}
        onMarkAsRead={markAsRead}
        onStartEdit={startEdit}
        onDelete={deleteNotification}
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

async function loadParentRecipientOptions() {
  const children = await childrenApi.getAll({
    search: "",
    groupId: "",
    isActive: "true",
  });

  const parentMap = new Map();

  children.forEach((child) => {
    child.parents.forEach((parent) => {
      const parentId = parent.id ?? parent.parentId;

      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, {
          value: parentId,
          label: parent.email
            ? `${parent.fullName} - ${parent.email}`
            : parent.fullName,
        });
      }
    });
  });

  return Array.from(parentMap.values());
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
