import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    cancelRef.current?.focus();
    return () => dialog.close();
  }, []);
  function close() {
    dialogRef.current?.close();
    onClose();
  }
  return (
    <dialog
      ref={dialogRef}
      className="task-dialog confirmation-dialog"
      aria-labelledby="confirmation-heading"
      aria-describedby="confirmation-description"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="dialog-heading">
        <h2 id="confirmation-heading">{title}</h2>
        <button
          className="close-button"
          aria-label="Fechar confirmação"
          onClick={close}
        >
          ×
        </button>
      </div>
      <p id="confirmation-description">{children}</p>
      <div className="form-actions">
        <button ref={cancelRef} className="secondary-button" onClick={close}>
          Cancelar
        </button>
        <button
          className="danger-button"
          onClick={() => {
            onConfirm();
            close();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
