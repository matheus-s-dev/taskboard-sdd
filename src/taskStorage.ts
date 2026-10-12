import { isTaskList, type Task } from "./task";

export const STORAGE_KEY = "taskboard-sdd:tasks:v1";
export type TaskStorage = Pick<Storage, "getItem" | "setItem">;

export type LoadTasksResult = {
  status: "ready" | "empty" | "invalid" | "unavailable";
  tasks: Task[];
};

export function loadTasks(storage: TaskStorage): LoadTasksResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: "unavailable", tasks: [] };
  }
  if (raw === null) return { status: "empty", tasks: [] };

  try {
    const envelope: unknown = JSON.parse(raw);
    if (
      typeof envelope !== "object" ||
      envelope === null ||
      Array.isArray(envelope) ||
      !("version" in envelope) ||
      envelope.version !== 1 ||
      !("tasks" in envelope) ||
      !isTaskList(envelope.tasks)
    ) {
      return { status: "invalid", tasks: [] };
    }
    return { status: "ready", tasks: envelope.tasks };
  } catch {
    // Reads never alter storage: replacing corrupt data requires confirmation.
    return { status: "invalid", tasks: [] };
  }
}

export function saveTasks(
  storage: TaskStorage,
  tasks: readonly Task[],
): boolean {
  if (!isTaskList(tasks)) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }));
    return true;
  } catch {
    return false;
  }
}
