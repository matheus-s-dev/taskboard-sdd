import { useRef, useState } from "react";
import TaskBoard from "./TaskBoard";
import TaskForm from "./TaskForm";
import { exampleTasks, priorityLabels, statuses, statusLabels } from "./task";
import type { Priority, Task, TaskDraft, TaskStatus } from "./task";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(exampleTasks);
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
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

  function createTask(draft: TaskDraft) {
    setTasks((previous) => [
      {
        ...draft,
        id: crypto.randomUUID(),
        status: "todo",
        createdAt: new Date().toISOString(),
      },
      ...previous,
    ]);
    resetFilters();
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
              onClick={() => setFormOpen(true)}
            >
              <span aria-hidden="true">＋</span> Nova tarefa
            </button>
          </div>

          <div className="demo-notice">
            <span className="demo-symbol" aria-hidden="true">
              i
            </span>
            <p>
              <strong>Um espaço para experimentar.</strong> Os exemplos e as
              novas tarefas reiniciam ao atualizar a página.
            </p>
            <span className="demo-pill">DEMONSTRAÇÃO</span>
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
                <button className="text-button" onClick={resetFilters}>
                  Limpar filtros
                </button>
              )}
            </div>
            <p className="result-count" role="status" aria-live="polite">
              {visibleTasks.length} de {tasks.length} tarefas
            </p>
          </section>

          <TaskBoard
            tasks={visibleTasks}
            filtered={filtered}
            onReset={resetFilters}
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
          onSave={createTask}
          onClose={() => {
            setFormOpen(false);
            addButtonRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
