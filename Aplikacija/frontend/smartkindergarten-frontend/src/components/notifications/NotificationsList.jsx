import { FaEdit, FaTrashAlt } from "react-icons/fa";

function NotificationsList({
  notifications,
  isLoading,
  currentUserId,
  userRole,
  onMarkAsRead,
  onStartEdit,
  onDelete,
}) {
  if (isLoading) {
    return <div className="alert alert-info">Učitavanje obaveštenja...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="alert alert-info">
        Nema obaveštenja za izabrane filtere.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {notifications.map((notification) => {
        const myRecipient = getMyRecipient(notification, currentUserId);
        const isRead = myRecipient?.isRead ?? false;
        const canMarkAsRead = myRecipient && !isRead;
        const canModify =
          userRole === "Administrator" ||
          Number(notification.senderId) === Number(currentUserId);

        return (
          <div key={notification.id} className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <h5 className="card-title mb-1">
                    {notification.title}{" "}
                    {myRecipient && (
                      <span
                        className={
                          isRead
                            ? "badge bg-secondary ms-2"
                            : "badge bg-warning text-dark ms-2"
                        }
                      >
                        {isRead ? "Pročitano" : "Novo"}
                      </span>
                    )}
                  </h5>

                  <div className="text-muted small mb-3">
                    Poslao/la: {notification.senderFullName} ·{" "}
                    {formatDateTime(notification.createdAt)}
                  </div>
                </div>

                {(canMarkAsRead || canModify) && (
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-outline-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      Akcije
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                      {canMarkAsRead && (
                        <li>
                          <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => onMarkAsRead(notification)}
                          >
                            Označi kao pročitano
                          </button>
                        </li>
                      )}

                      {canModify && (
                        <>
                          {canMarkAsRead && (
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                          )}

                          <li>
                            <button
                              className="dropdown-item"
                              type="button"
                              onClick={() => onStartEdit(notification)}
                            >
                              <FaEdit className="me-2" />
                              Izmeni
                            </button>
                          </li>

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              type="button"
                              onClick={() => onDelete(notification)}
                            >
                              <FaTrashAlt className="me-2" />
                              Obriši
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <p className="card-text">{notification.content}</p>

              <div className="mt-3">
                <small className="text-muted">
                  Primaoci:{" "}
                  {notification.recipients
                    .map((recipient) => recipient.recipientFullName)
                    .join(", ")}
                </small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getMyRecipient(notification, currentUserId) {
  return notification.recipients.find(
    (recipient) => Number(recipient.userId) === Number(currentUserId)
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("sr-RS");
}

export default NotificationsList;
