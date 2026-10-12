import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { validateTaskDraft } from "./task";
import type { Priority, Task, TaskDraft } from "./task";

export default function TaskForm({
  task,
  onSave,
  onClose,
}: {
  task: Task | null;
  onSave: (draft: TaskDraft) => boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? "medium",
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskDraft, string>>
  >({});
  const [saveError, setSaveError] = useState("");

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
    const draft = {
      title,
      description,
      priority,
      dueDate: String(new FormData(event.currentTarget).get("dueDate") ?? ""),
    };
    const validation = validateTaskDraft(draft);
    const dueInput =
      event.currentTarget.querySelector<HTMLInputElement>("#task-due");
    if (dueInput?.validity.badInput)
      validation.dueDate = "Complete uma data válida ou limpe o campo.";
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      const invalidField = Object.keys(validation)[0];
      event.currentTarget
        .querySelector<HTMLElement>(`[data-field="${invalidField}"]`)
        ?.focus();
      return;
    }
    if (onSave(draft)) handleClose();
    else
      setSaveError(
        "Não foi possível alterar esta tarefa. Feche o formulário e confira o aviso no quadro.",
      );
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
          <span className="eyebrow">
            {task ? "UM AJUSTE NO CAMINHO" : "UM NOVO COMEÇO"}
          </span>
          <h2 id="form-heading">
            {task ? "Editar tarefa" : "Qual é o próximo passo?"}
          </h2>
        </div>
        <button
          className="close-button"
          aria-label="Fechar formulário"
          onClick={handleClose}
        >
          ×
        </button>
      </div>
      <p id="form-intro">
        {task
          ? "Atualize os detalhes. O estado da tarefa será mantido."
          : "Sua nova tarefa começa em A fazer."}
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="task-title">
          Título <span aria-hidden="true">*</span>
        </label>
        <input
          ref={titleRef}
          id="task-title"
          data-field="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((previous) => ({ ...previous, title: undefined }));
          }}
          required
          placeholder="O que você quer fazer?"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : "title-hint"}
        />
        <span id="title-hint" className="field-hint">
          Até 100 caracteres, sem contar os espaços nas extremidades.
        </span>
        {errors.title && (
          <p id="title-error" className="field-error" role="alert">
            {errors.title}
          </p>
        )}
        <label htmlFor="task-description">
          Descrição <span className="optional">opcional</span>
        </label>
        <textarea
          id="task-description"
          data-field="description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors((previous) => ({ ...previous, description: undefined }));
          }}
          rows={3}
          placeholder="Um pouco de contexto ajuda a começar."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "description-error" : "description-hint"
          }
        />
        <span id="description-hint" className="field-hint">
          Até 500 caracteres.
        </span>
        {errors.description && (
          <p id="description-error" className="field-error" role="alert">
            {errors.description}
          </p>
        )}
        <div className="form-row">
          <div>
            <label htmlFor="task-priority">Prioridade</label>
            <select
              id="task-priority"
              data-field="priority"
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
            <input
              id="task-due"
              name="dueDate"
              data-field="dueDate"
              type="date"
              defaultValue={task?.dueDate ?? ""}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? "due-error" : undefined}
            />
          </div>
        </div>
        {errors.dueDate && (
          <p id="due-error" className="field-error" role="alert">
            {errors.dueDate}
          </p>
        )}
        {saveError && (
          <p className="field-error" role="alert">
            {saveError}
          </p>
        )}
        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button className="primary-button" type="submit">
            {task ? "Salvar alterações" : "Criar tarefa"}{" "}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </dialog>
  );
}
