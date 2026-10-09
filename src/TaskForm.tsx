import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Priority, TaskDraft } from "./task";

export default function TaskForm({
  onSave,
  onClose,
}: {
  onSave: (draft: TaskDraft) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    titleRef.current?.focus();
    return () => dialog.close();
  }, []);

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !title.trim() ||
      title.trim().length > 100 ||
      description.length > 500
    ) {
      setError(
        "Informe um título de 1 a 100 caracteres e uma descrição de até 500.",
      );
      titleRef.current?.focus();
      return;
    }
    const dueDate = String(
      new FormData(event.currentTarget).get("dueDate") ?? "",
    );
    onSave({ title: title.trim(), description, priority, dueDate });
    handleClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog"
      aria-labelledby="form-heading"
      aria-describedby="form-intro"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
    >
      <div className="dialog-heading">
        <div>
          <span className="eyebrow">UM NOVO COMEÇO</span>
          <h2 id="form-heading">Qual é o próximo passo?</h2>
        </div>
        <button
          className="close-button"
          aria-label="Fechar formulário"
          onClick={handleClose}
        >
          ×
        </button>
      </div>
      <p id="form-intro">Sua nova tarefa começa em A fazer.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">
          Título <span aria-hidden="true">*</span>
        </label>
        <input
          ref={titleRef}
          id="task-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
          required
          maxLength={100}
          placeholder="O que você quer fazer?"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "title-error" : undefined}
        />
        {error && (
          <p id="title-error" className="field-error" role="alert">
            {error}
          </p>
        )}
        <label htmlFor="task-description">
          Descrição <span className="optional">opcional</span>
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Um pouco de contexto ajuda a começar."
        />
        <div className="form-row">
          <div>
            <label htmlFor="task-priority">Prioridade</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-due">
              Prazo <span className="optional">opcional</span>
            </label>
            <input id="task-due" name="dueDate" type="date" />
          </div>
        </div>
        <p className="form-note">
          Nesta demonstração, as tarefas duram até atualizar a página.
        </p>
        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button className="primary-button" type="submit">
            Criar tarefa <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </dialog>
  );
}
