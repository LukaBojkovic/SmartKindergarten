import { useState } from "react";
import { FaCheck, FaEdit, FaTrashAlt } from "react-icons/fa";
import { USER_ROLES } from "../../constants/userRoles";
import { formatDateTime } from "../../utils/formatters";

const VISIBLE_RECIPIENT_COUNT = 3;

function NotificationsList({
  notifications,
  isLoading,
  currentUserId,
  userRole,
  onMarkAsRead,
  onStartEdit,
  onDelete,
}) {
  const [expandedRecipientLists, setExpandedRecipientLists] = useState({});

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
        const isSender = Number(notification.senderId) === Number(currentUserId);
        const canEdit = isSender;
        const canDelete = isSender || userRole === USER_ROLES.ADMINISTRATOR;
        const canModify = canEdit || canDelete;
        const canViewRecipients = userRole !== USER_ROLES.PARENT;
        const recipientNames = notification.recipients.map(
          (recipient) => recipient.recipientFullName
        );
        const isRecipientListExpanded = Boolean(
          expandedRecipientLists[notification.id]
        );
        const visibleRecipientNames = isRecipientListExpanded
          ? recipientNames
          : recipientNames.slice(0, VISIBLE_RECIPIENT_COUNT);
        const hiddenRecipientCount =
          recipientNames.length - VISIBLE_RECIPIENT_COUNT;

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

                {canMarkAsRead && !canModify && (
                  <button
                    className="btn btn-sm btn-outline-primary text-nowrap"
                    type="button"
                    onClick={() => onMarkAsRead(notification)}
                  >
                    <FaCheck className="me-2" />
                    Označi kao pročitano
                  </button>
                )}

                {canModify && (
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
                            <FaCheck className="me-2" />
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

                          {canEdit && (
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
                          )}

                          {canDelete && (
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
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <p className="card-text">{notification.content}</p>

              {canViewRecipients && recipientNames.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-1">
                    Primaoci ({recipientNames.length}):
                  </small>

                  <div className="d-flex flex-wrap gap-2">
                    {visibleRecipientNames.map((recipientName) => (
                      <span
                        key={recipientName}
                        className="badge text-bg-secondary"
                      >
                        {recipientName}
                      </span>
                    ))}

                    {hiddenRecipientCount > 0 && !isRecipientListExpanded && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 align-baseline"
                        onClick={() =>
                          setExpandedRecipientLists((previousLists) => ({
                            ...previousLists,
                            [notification.id]: true,
                          }))
                        }
                      >
                        još {hiddenRecipientCount}
                      </button>
                    )}

                    {isRecipientListExpanded &&
                      recipientNames.length > VISIBLE_RECIPIENT_COUNT && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 align-baseline"
                          onClick={() =>
                            setExpandedRecipientLists((previousLists) => ({
                              ...previousLists,
                              [notification.id]: false,
                            }))
                          }
                        >
                          prikaži manje
                        </button>
                      )}
                  </div>
                </div>
              )}
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

export default NotificationsList;
