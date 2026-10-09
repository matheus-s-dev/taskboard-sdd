import { priorityLabels, statuses, statusLabels } from "./task";
import type { Task } from "./task";

function formatDueDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function TaskCard({ task }: { task: Task }) {
  return (
    <article
      className={`task-card task-card--${task.status}`}
      aria-labelledby={`task-${task.id}`}
    >
      <div className="card-topline">
        <span className={`priority priority--${task.priority}`}>
          <span aria-hidden="true">≡</span> {priorityLabels[task.priority]}
        </span>
        {task.status === "done" && (
          <span className="done-mark" aria-label="Tarefa concluída">
            ✓
          </span>
        )}
      </div>
      <h3 id={`task-${task.id}`}>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="card-footer">
        {task.dueDate ? (
          <time
            dateTime={task.dueDate}
            aria-label={`Prazo: ${task.dueDate.split("-").reverse().join("/")}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <rect x="4" y="5" width="16" height="16" rx="3" />
              <path d="M8 3v4m8-4v4M4 11h16" />
            </svg>
            {formatDueDate(task.dueDate)}
          </time>
        ) : (
          <span>Sem prazo</span>
        )}
        <span>{statusLabels[task.status]}</span>
      </div>
    </article>
  );
}

export default function TaskBoard({
  tasks,
  filtered,
  onReset,
}: {
  tasks: Task[];
  filtered: boolean;
  onReset: () => void;
}) {
  return (
    <>
      {tasks.length === 0 && (
        <div className="empty-results" role="status">
          <strong>
            {filtered
              ? "Nenhuma tarefa por aqui."
              : "Espaço livre para começar."}
          </strong>
          <p>
            {filtered
              ? "Experimente outra combinação de filtros."
              : "Crie uma tarefa para dar o primeiro passo."}
          </p>
          {filtered && (
            <button className="text-button" onClick={onReset}>
              Limpar filtros <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
      )}
      <div className="board" aria-label="Quadro de tarefas">
        {statuses.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <section
              className={`column column--${status}`}
              aria-labelledby={`column-${status}`}
              key={status}
            >
              <div className="column-heading">
                <h2 id={`column-${status}`}>
                  <span className="status-dot" aria-hidden="true" />
                  {statusLabels[status]}
                </h2>
                <span
                  className="column-count"
                  aria-label={`${columnTasks.length} tarefas`}
                >
                  {columnTasks.length}
                </span>
              </div>
              <p className="column-caption">
                {
                  {
                    todo: "Ideias que viram próximos passos.",
                    doing: "Uma coisa de cada vez.",
                    done: "Pequenas conquistas, grande avanço.",
                  }[status]
                }
              </p>
              <div className="task-list">
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {columnTasks.length === 0 && (
                  <p className="empty-column">Nenhuma tarefa nesta etapa.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
