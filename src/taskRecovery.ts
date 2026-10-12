import type { Task } from "./task";
import { loadTasks, saveTasks } from "./taskStorage";
import type { LoadTasksResult, TaskStorage } from "./taskStorage";

export type StorageState = "saved" | "unavailable" | "invalid" | "unsaved";

export interface TasksSnapshot {
  tasks: Task[];
  storageState: StorageState;
  needsRead: boolean;
}

interface RecoveryDecision extends TasksSnapshot {
  shouldSave: boolean;
}

// Decide recovery without changing storage. Session tasks have fresh IDs;
// retain saved tasks if an ID ever collides so existing data is preserved.
export function resolveUnreadTasks(
  sessionTasks: Task[],
  loaded: LoadTasksResult,
): RecoveryDecision {
  if (loaded.status === "unavailable" || loaded.status === "invalid") {
    return {
      tasks: sessionTasks,
      storageState: loaded.status === "invalid" ? "invalid" : "unsaved",
      needsRead: loaded.status === "unavailable",
      shouldSave: false,
    };
  }

  const savedIds = new Set(loaded.tasks.map((task) => task.id));
  const newTasks = sessionTasks.filter((task) => !savedIds.has(task.id));
  return {
    tasks: [...newTasks, ...loaded.tasks],
    storageState: "saved",
    needsRead: false,
    // No session tasks means recovery only restores the saved board.
    shouldSave: newTasks.length > 0,
  };
}

export function persistTaskSnapshot(
  storage: TaskStorage | null,
  tasks: Task[],
  needsRead: boolean,
): TasksSnapshot {
  if (!storage) return { tasks, storageState: "unsaved", needsRead };

  if (needsRead) {
    const { shouldSave, ...recovered } = resolveUnreadTasks(
      tasks,
      loadTasks(storage),
    );
    // An unread, corrupt, or unchanged saved board is never overwritten.
    if (!shouldSave) return recovered;
    tasks = recovered.tasks;
    needsRead = recovered.needsRead;
  }

  return {
    tasks,
    storageState: saveTasks(storage, tasks) ? "saved" : "unsaved",
    needsRead,
  };
}
