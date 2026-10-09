export const statuses = ["todo", "doing", "done"] as const;
export type TaskStatus = (typeof statuses)[number];
export type Priority = "low" | "medium" | "high";

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

// Exemplos temporários para revisar a interface antes da etapa de persistência.
export const exampleTasks: Task[] = [
  {
    id: "example-4",
    title: "Dar forma à primeira ideia",
    description: "Anotar o que é essencial e escolher o próximo passo.",
    priority: "high",
    dueDate: "2026-10-09",
    status: "todo",
    createdAt: "2026-10-08T16:00:00.000Z",
  },
  {
    id: "example-3",
    title: "Separar referências para a interface",
    description: "Buscar formas simples de organizar o dia.",
    priority: "low",
    dueDate: "2026-10-10",
    status: "todo",
    createdAt: "2026-10-08T15:00:00.000Z",
  },
  {
    id: "example-2",
    title: "Construir o quadro de tarefas",
    description:
      "Uma visão clara do que está por vir e do que já está acontecendo.",
    priority: "medium",
    dueDate: "2026-10-08",
    status: "doing",
    createdAt: "2026-10-08T14:00:00.000Z",
  },
  {
    id: "example-1",
    title: "Definir o escopo do projeto",
    description: "Começar pequeno, com espaço para evoluir.",
    priority: "medium",
    dueDate: "",
    status: "done",
    createdAt: "2026-10-07T14:00:00.000Z",
  },
];
