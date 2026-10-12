import { useRef, useState } from "react";
import { addTask, changeTaskStatus, removeTask, updateTask } from "./task";
import type { Task, TaskDraft, TaskStatus } from "./task";
import { loadTasks } from "./taskStorage";
import type { TaskStorage } from "./taskStorage";
import { persistTaskSnapshot } from "./taskRecovery";
import type { TasksSnapshot } from "./taskRecovery";

export type { StorageState } from "./taskRecovery";

function accessStorage(): TaskStorage | null {
  try {
    return window.localStorage;
  } catch {
    // Accessing localStorage itself can fail when browser storage is blocked.
    return null;
  }
}

function initializeTasks(): TasksSnapshot {
  const storage = accessStorage();
  if (!storage) {
    return { tasks: [], storageState: "unavailable", needsRead: true };
  }

  const loaded = loadTasks(storage);
  return {
    tasks: loaded.tasks,
    needsRead: loaded.status === "unavailable",
    storageState:
      loaded.status === "invalid"
        ? "invalid"
        : loaded.status === "unavailable"
          ? "unavailable"
          : "saved",
  };
}

export function useTasks() {
  // Initialization only reads: StrictMode can repeat it without writing data.
  const [snapshot, setSnapshot] = useState(initializeTasks);
  const latest = useRef(snapshot);

  function persist(
    tasks: Task[],
    needsRead = latest.current.needsRead,
  ): boolean {
    // Retry the getter each time so previously blocked storage can recover.
    // If initialization could not read, recover saved tasks before any write.
    const next = persistTaskSnapshot(accessStorage(), tasks, needsRead);

    // Update synchronously, before React batches renders, to preserve rapid
    // consecutive actions. Persistence never runs inside a state updater.
    latest.current = next;
    setSnapshot(next);
    return next.storageState === "saved";
  }

  function create(draft: TaskDraft): boolean {
    if (latest.current.storageState === "invalid") return false;

    persist(
      addTask(latest.current.tasks, draft, {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }),
    );
    // A failed write still accepts the operation in memory.
    return true;
  }

  function update(id: string, draft: TaskDraft): boolean {
    const current = latest.current;
    if (
      current.storageState === "invalid" ||
      !current.tasks.some((task) => task.id === id)
    ) {
      return false;
    }

    persist(updateTask(current.tasks, id, draft));
    return true;
  }

  function changeStatus(id: string, status: TaskStatus): boolean {
    const current = latest.current;
    if (
      current.storageState === "invalid" ||
      !current.tasks.some((task) => task.id === id)
    ) {
      return false;
    }

    persist(changeTaskStatus(current.tasks, id, status));
    return true;
  }

  function remove(id: string): boolean {
    const current = latest.current;
    if (
      current.storageState === "invalid" ||
      !current.tasks.some((task) => task.id === id)
    ) {
      return false;
    }

    persist(removeTask(current.tasks, id));
    return true;
  }

  function resetInvalidStorage(): boolean {
    // The caller confirms the reset. Ordinary mutations and retries cannot
    // overwrite malformed data; this is the sole path that unlocks it.
    if (latest.current.storageState !== "invalid") return false;
    // Confirmation authorizes replacing the stored data, bypassing recovery.
    return persist([], false);
  }

  function retrySave(): boolean {
    if (latest.current.storageState === "invalid") return false;
    return persist(latest.current.tasks);
  }

  return {
    tasks: snapshot.tasks,
    storageState: snapshot.storageState,
    create,
    update,
    changeStatus,
    remove,
    resetInvalidStorage,
    retrySave,
  };
}

export default useTasks;
