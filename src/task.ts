export const statuses = ["todo", "doing", "done"] as const;
export type TaskStatus = (typeof statuses)[number];
export const priorities = ["low", "medium", "high"] as const;
export type Priority = (typeof priorities)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
}

export type TaskDraft = Pick<
  Task,
  "title" | "description" | "priority" | "dueDate"
>;

export type TaskDraftErrors = Partial<Record<keyof TaskDraft, string>>;

export const statusLabels: Record<TaskStatus, string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluído",
};

export const priorityLabels: Record<Priority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCalendarDate(value: string): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day <= daysInMonth[month - 1];
}

function isTimestamp(value: unknown): value is string {
  // Timestamps are generated with Date.toISOString(), so retain that format.
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }
  if (!isCalendarDate(value.slice(0, 10))) return false;
  const timestamp = new Date(value);
  return (
    Number.isFinite(timestamp.getTime()) && timestamp.toISOString() === value
  );
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateTaskDraft(draft: TaskDraft): TaskDraftErrors {
  const value: Record<string, unknown> = isRecord(draft) ? draft : {};
  const errors: TaskDraftErrors = {};

  if (typeof value.title !== "string" || value.title.trim().length === 0) {
    errors.title = "Informe um título para a tarefa.";
  } else if (value.title.trim().length > 100) {
    errors.title = "O título deve ter até 100 caracteres.";
  }

  if (typeof value.description !== "string") {
    errors.description = "Informe uma descrição válida ou deixe o campo vazio.";
  } else if (value.description.length > 500) {
    errors.description = "A descrição deve ter até 500 caracteres.";
  }

  if (!priorities.some((priority) => priority === value.priority)) {
    errors.priority = "Selecione uma prioridade válida.";
  }

  if (
    typeof value.dueDate !== "string" ||
    (value.dueDate !== "" && !isCalendarDate(value.dueDate))
  ) {
    errors.dueDate = "Informe uma data válida ou deixe o campo vazio.";
  }

  return errors;
}

export class TaskValidationError extends Error {
  constructor(public readonly errors: TaskDraftErrors) {
    super("Revise os campos da tarefa.");
    this.name = "TaskValidationError";
  }
}

function normalizedDraft(draft: TaskDraft): TaskDraft {
  const errors = validateTaskDraft(draft);
  if (Object.keys(errors).length > 0) throw new TaskValidationError(errors);
  return {
    title: draft.title.trim(),
    description: draft.description,
    priority: draft.priority,
    dueDate: draft.dueDate,
  };
}

export function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;
  return (
    isIdentifier(value.id) &&
    isTimestamp(value.createdAt) &&
    statuses.some((status) => status === value.status) &&
    Object.keys(validateTaskDraft(value as unknown as TaskDraft)).length ===
      0 &&
    value.title === (value.title as string).trim()
  );
}

export function isTaskList(value: unknown): value is Task[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  for (const task of value) {
    if (!isTask(task) || ids.has(task.id)) return false;
    ids.add(task.id);
  }
  return true;
}

function assertTaskList(tasks: readonly Task[]): void {
  if (!isTaskList(tasks)) throw new Error("A lista de tarefas é inválida.");
}

function assertExistingTask(tasks: readonly Task[], id: string): void {
  assertTaskList(tasks);
  if (!isIdentifier(id) || !tasks.some((task) => task.id === id)) {
    throw new Error("Tarefa não encontrada.");
  }
}

export function addTask(
  tasks: readonly Task[],
  draft: TaskDraft,
  metadata: Pick<Task, "id" | "createdAt">,
): Task[] {
  assertTaskList(tasks);
  const values = normalizedDraft(draft);
  if (
    !isRecord(metadata) ||
    !isIdentifier(metadata.id) ||
    !isTimestamp(metadata.createdAt)
  ) {
    throw new Error("Os dados de criação da tarefa são inválidos.");
  }
  if (tasks.some((task) => task.id === metadata.id)) {
    throw new Error("Já existe uma tarefa com este identificador.");
  }
  return [
    {
      ...values,
      id: metadata.id,
      createdAt: metadata.createdAt,
      status: "todo",
    },
    ...tasks,
  ];
}

export function updateTask(
  tasks: readonly Task[],
  id: string,
  draft: TaskDraft,
): Task[] {
  assertExistingTask(tasks, id);
  const values = normalizedDraft(draft);
  return tasks.map((task) => (task.id === id ? { ...task, ...values } : task));
}

export function changeTaskStatus(
  tasks: readonly Task[],
  id: string,
  status: TaskStatus,
): Task[] {
  assertExistingTask(tasks, id);
  if (!statuses.some((candidate) => candidate === status)) {
    throw new Error("O estado da tarefa é inválido.");
  }
  return tasks.map((task) => (task.id === id ? { ...task, status } : task));
}

export function removeTask(tasks: readonly Task[], id: string): Task[] {
  assertExistingTask(tasks, id);
  return tasks.filter((task) => task.id !== id);
}
