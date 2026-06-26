import { useCallback, useState } from "react";
import { ConfirmContext } from "./confirmContext";

const initialConfirmState = {
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Potvrdi",
  cancelText: "Otkaži",
  variant: "danger",
  resolve: null,
};

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(initialConfirmState);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        ...initialConfirmState,
        ...options,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const closeConfirm = (result) => {
    confirmState.resolve?.(result);
    setConfirmState(initialConfirmState);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {confirmState.isOpen && (
        <div
          className="modal fade show app-confirm-backdrop"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content app-confirm-modal">
              <div className="modal-header">
                <h5 className="modal-title">{confirmState.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Zatvori"
                  onClick={() => closeConfirm(false)}
                />
              </div>

              <div className="modal-body">
                <p className="mb-0">{confirmState.message}</p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => closeConfirm(false)}
                >
                  {confirmState.cancelText}
                </button>

                <button
                  type="button"
                  className={`btn btn-${confirmState.variant}`}
                  onClick={() => closeConfirm(true)}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
