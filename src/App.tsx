import { useRef, useState } from "react";
import TaskBoard from "./TaskBoard";
import TaskForm from "./TaskForm";
import ConfirmDialog from "./ConfirmDialog";
import useTasks from "./useTasks";
import { priorityLabels, statuses, statusLabels } from "./task";
import type { Priority, Task, TaskDraft, TaskStatus } from "./task";

export default function App() {
  const {
    tasks,
    storageState,
    create,
    update,
    changeStatus,
    remove,
    resetInvalidStorage,
    retrySave,
  } = useTasks();
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const filtered = status !== "all" || priority !== "all";
  const visibleTasks = tasks
    .filter(
      (task) =>
        (status === "all" || task.status === status) &&
        (priority === "all" || task.priority === priority),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function resetFilters() {
    setStatus("all");
    setPriority("all");
  }

  function focusControl(preferred: HTMLElement | null) {
    const candidates = [
      preferred,
      document.getElementById("storage-recovery"),
      addButtonRef.current,
      document.getElementById("status-filter"),
    ];
    const target = candidates.find(
      (candidate) => candidate?.isConnected && !candidate.matches(":disabled"),
    );
    target?.focus();
  }

  function restoreFocus() {
    requestAnimationFrame(() => focusControl(returnFocusRef.current));
  }

  function clearFilters() {
    resetFilters();
    requestAnimationFrame(() =>
      focusControl(document.getElementById("status-filter")),
    );
  }

  function openCreate() {
    returnFocusRef.current = addButtonRef.current;
    setEditingTask(null);
    setFormOpen(true);
  }

  function saveTask(draft: TaskDraft) {
    const accepted = editingTask
      ? update(editingTask.id, draft)
      : create(draft);
    if (accepted) {
      setAnnouncement(
        editingTask ? "Tarefa atualizada." : "Tarefa criada em A fazer.",
      );
      if (!editingTask) resetFilters();
    }
    return accepted;
  }

  function moveTask(task: Task, nextStatus: TaskStatus) {
    if (changeStatus(task.id, nextStatus)) {
      setAnnouncement(`${task.title}: ${statusLabels[nextStatus]}.`);
      requestAnimationFrame(() => {
        const control = document.getElementById(`status-${task.id}`);
        focusControl(control);
      });
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para o quadro
      </a>
      <aside className="sidebar" aria-label="Espaço pessoal">
        <a
          className="brand"
          href="#main"
          aria-label="Taskboard, ir para o quadro"
        >
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          taskboard<span className="brand-period">.</span>
        </a>
        <p className="brand-caption">Seu dia, com clareza.</p>
        <div className="workspace-label">ESPAÇO PESSOAL</div>
        <button
          className="workspace-link"
          onClick={resetFilters}
          aria-current="page"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="18" rx="2" />
            <rect x="14" y="3" width="7" height="11" rx="2" />
          </svg>
          Meu quadro <span className="sidebar-count">{tasks.length}</span>
        </button>
        <div className="sidebar-bottom">
          <div className="small-spark" aria-hidden="true">
            ✳
          </div>
          <p>
            Um passo por vez.
            <br />
            <strong>Você chega lá.</strong>
          </p>
          <span>Seu espaço para fazer acontecer.</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <span>
            Pessoal <span className="breadcrumb-slash">/</span>{" "}
            <strong>Meu quadro</strong>
          </span>
          <span className="personal-label">
            <span aria-hidden="true" /> Só seu
          </span>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                ORGANIZE O HOJE. ABRA ESPAÇO PARA O AMANHÃ.
              </span>
              <h1>
                Meu quadro<span className="heading-dot">.</span>
              </h1>
              <p>Ideias no lugar. Um próximo passo mais claro.</p>
            </div>
            <button
              ref={addButtonRef}
              className="primary-button new-task"
              onClick={openCreate}
              disabled={storageState === "invalid"}
            >
              <span aria-hidden="true">＋</span> Nova tarefa
            </button>
          </div>

          <div
            className={`demo-notice storage-notice storage-notice--${storageState}`}
            role={storageState === "saved" ? "status" : "alert"}
          >
            <span className="demo-symbol" aria-hidden="true">
              i
            </span>
            <p>
              {storageState === "saved" ? (
                <>
                  <strong>Seu quadro fica aqui.</strong> As tarefas são salvas
                  neste navegador e continuam após atualizar a página.
                </>
              ) : storageState === "invalid" ? (
                <>
                  <strong>Não foi possível ler as tarefas salvas.</strong> Os
                  dados existentes foram preservados. Para começar novamente,
                  confirme a criação de uma lista vazia.
                </>
              ) : (
                <>
                  <strong>As alterações estão apenas nesta sessão.</strong> Não
                  foi possível acessar ou gravar no armazenamento deste
                  navegador. As mudanças podem se perder ao atualizar ou fechar
                  a página.
                </>
              )}
            </p>
            {storageState === "invalid" ? (
              <button
                id="storage-recovery"
                className="text-button"
                onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setResetOpen(true);
                }}
              >
                Iniciar lista vazia
              </button>
            ) : storageState !== "saved" ? (
              <button
                className="text-button"
                onClick={(event) => {
                  const trigger = event.currentTarget;
                  if (retrySave()) {
                    setAnnouncement("Tarefas salvas neste navegador.");
                    requestAnimationFrame(() =>
                      focusControl(addButtonRef.current),
                    );
                  } else {
                    requestAnimationFrame(() => focusControl(trigger));
                  }
                }}
              >
                Tentar salvar novamente
              </button>
            ) : (
              <span className="demo-pill">SALVAMENTO LOCAL</span>
            )}
          </div>
          <div className="sr-only" role="status" aria-live="polite">
            {announcement}
          </div>

          <section className="filterbar" aria-label="Filtrar tarefas">
            <div className="filter-controls">
              <div className="filter">
                <label htmlFor="status-filter">Estado</label>
                <select
                  id="status-filter"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TaskStatus | "all")
                  }
                >
                  <option value="all">Todos os estados</option>
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {statusLabels[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter">
                <label htmlFor="priority-filter">Prioridade</label>
                <select
                  id="priority-filter"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as Priority | "all")
                  }
                >
                  <option value="all">Todas as prioridades</option>
                  {(["high", "medium", "low"] as const).map((value) => (
                    <option key={value} value={value}>
                      {priorityLabels[value]}
                    </option>
                  ))}
                </select>
              </div>
              {filtered && (
                <button className="text-button" onClick={clearFilters}>
                  Limpar filtros
                </button>
              )}
            </div>
            <p className="result-count" role="status" aria-live="polite">
              {visibleTasks.length} de {tasks.length} tarefas
            </p>
          </section>

          <TaskBoard
            actionsDisabled={storageState === "invalid"}
            tasks={visibleTasks}
            filtered={filtered}
            onReset={clearFilters}
            onEdit={(task, trigger) => {
              returnFocusRef.current = trigger;
              setEditingTask(task);
              setFormOpen(true);
            }}
            onDelete={(task, trigger) => {
              returnFocusRef.current = trigger;
              setDeletingTask(task);
            }}
            onChangeStatus={moveTask}
          />
          <footer className="board-footer">
            <span>
              <span aria-hidden="true">↗</span> Cada tarefa concluída é um passo
              adiante.
            </span>
            <span>Feito para o seu ritmo.</span>
          </footer>
        </main>
      </div>
      {formOpen && (
        <TaskForm
          task={editingTask}
          onSave={saveTask}
          onClose={() => {
            setFormOpen(false);
            restoreFocus();
          }}
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          title="Excluir tarefa?"
          confirmLabel="Excluir tarefa"
          onConfirm={() => {
            if (remove(deletingTask.id)) setAnnouncement("Tarefa excluída.");
          }}
          onClose={() => {
            setDeletingTask(null);
            restoreFocus();
          }}
        >
          A tarefa <strong>“{deletingTask.title}”</strong> será removida deste
          navegador. Deseja continuar?
        </ConfirmDialog>
      )}
      {resetOpen && (
        <ConfirmDialog
          title="Começar uma lista vazia?"
          confirmLabel="Substituir por lista vazia"
          onConfirm={() => {
            resetInvalidStorage();
            resetFilters();
            setAnnouncement("Lista vazia iniciada.");
          }}
          onClose={() => {
            setResetOpen(false);
            restoreFocus();
          }}
        >
          Os dados salvos que não puderam ser lidos serão substituídos por uma
          lista vazia. Confirme somente se deseja descartar esses dados e
          começar novamente. As tarefas criadas nesta sessão também serão
          descartadas.
        </ConfirmDialog>
      )}
    </div>
  );
}
