import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { useTasks } from "../src/useTasks";
import type { Task, TaskDraft } from "../src/task";
import { STORAGE_KEY, type TaskStorage } from "../src/taskStorage";

function task(id: string): Task {
  return {
    id,
    title: `Tarefa ${id}`,
    description: "Descrição original",
    priority: "medium",
    dueDate: "2026-10-12",
    status: "doing",
    createdAt: "2026-10-12T18:00:00.000Z",
  };
}

function draft(title: string): TaskDraft {
  return { title, description: "", priority: "medium", dueDate: "" };
}

function envelope(tasks: Task[]) {
  return JSON.stringify({ version: 1, tasks });
}

function memoryStorage(initial: string | null = null) {
  let raw = initial;
  const access = { readable: true, writable: true };
  const attempts: string[] = [];
  const writes: string[] = [];
  const storage: TaskStorage = {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      if (!access.readable) throw new Error("Read denied");
      return raw;
    },
    setItem(key, value) {
      assert.equal(key, STORAGE_KEY);
      attempts.push(value);
      if (!access.writable) throw new Error("Write denied");
      writes.push(value);
      raw = value;
    },
  };
  return {
    storage,
    access,
    attempts,
    writes,
    raw: () => raw,
    tasks: () => JSON.parse(raw!).tasks as Task[],
  };
}

function withHook(
  getStorage: () => TaskStorage,
  verify: (api: ReturnType<typeof useTasks>) => void,
) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      get localStorage() {
        return getStorage();
      },
    },
  });

  try {
    let captured: ReturnType<typeof useTasks> | undefined;
    function Probe() {
      captured = useTasks();
      return null;
    }
    renderToString(createElement(Probe));
    assert.ok(captured);
    // Server setters do not rerender. Reusing this captured API deliberately
    // verifies that action callbacks use the latest ref instead of old state.
    verify(captured);
  } finally {
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  }
}

for (const failure of ["getter", "read"] as const) {
  test(`RF06 hook: ${failure} inicialmente bloqueado recupera quadro sem escrever lista vazia`, () => {
    const saved = [task("saved")];
    const original = envelope(saved);
    const memory = memoryStorage(original);
    let getterBlocked = failure === "getter";
    memory.access.readable = failure !== "read";
    withHook(
      () => {
        if (getterBlocked) throw new Error("Getter denied");
        return memory.storage;
      },
      (api) => {
        assert.equal(api.storageState, "unavailable");
        assert.deepEqual(api.tasks, []);
        assert.deepEqual(memory.attempts, []);
        assert.equal(api.retrySave(), false);
        assert.deepEqual(memory.attempts, []);

        getterBlocked = false;
        memory.access.readable = true;
        assert.equal(api.retrySave(), true);
        assert.equal(memory.raw(), original);
        assert.deepEqual(memory.attempts, []);

        // Recovery updates the ref even without an intervening render.
        assert.equal(api.changeStatus("saved", "done"), true);
        assert.deepEqual(memory.tasks(), [{ ...saved[0], status: "done" }]);
      },
    );
  });
}

test("RF06 hook: recuperação combina quadro existente e duas criações rápidas da sessão", () => {
  const saved = [task("saved-a"), task("saved-b")];
  const memory = memoryStorage(envelope(saved));
  memory.access.readable = false;
  withHook(
    () => memory.storage,
    (api) => {
      assert.equal(api.create(draft("Primeira da sessão")), true);
      assert.equal(api.create(draft("Segunda da sessão")), true);
      assert.deepEqual(memory.attempts, []);
      assert.deepEqual(memory.tasks(), saved);

      memory.access.readable = true;
      assert.equal(api.retrySave(), true);
      const combined = memory.tasks();
      assert.equal(combined.length, 4);
      assert.deepEqual(combined.slice(2), saved);
      assert.deepEqual(
        combined.slice(0, 2).map((item) => item.title),
        ["Segunda da sessão", "Primeira da sessão"],
      );
      assert.equal(new Set(combined.map((item) => item.id)).size, 4);
      assert.equal(memory.writes.length, 1);
    },
  );
});

test("RF06 hook: lista inicialmente inválida bloqueia ações e tentativas até reset explícito", () => {
  const original = "{invalid}";
  const memory = memoryStorage(original);
  withHook(
    () => memory.storage,
    (api) => {
      assert.equal(api.storageState, "invalid");
      assert.equal(api.create(draft("Não deve salvar")), false);
      assert.equal(api.update("missing", draft("Não deve editar")), false);
      assert.equal(api.changeStatus("missing", "done"), false);
      assert.equal(api.remove("missing"), false);
      assert.equal(api.retrySave(), false);
      assert.equal(memory.raw(), original);
      assert.deepEqual(memory.attempts, []);

      assert.equal(api.resetInvalidStorage(), true);
      assert.deepEqual(memory.tasks(), []);
      assert.equal(memory.writes.length, 1);
      assert.equal(api.create(draft("Agora permitida")), true);
      assert.equal(memory.tasks()[0].title, "Agora permitida");
      assert.equal(api.resetInvalidStorage(), false);
      assert.equal(memory.writes.length, 2);
    },
  );
});

test("RF06 hook: corrupção descoberta após falha de leitura bloqueia as tarefas da sessão", () => {
  const original = JSON.stringify({ version: 2, tasks: [] });
  const memory = memoryStorage(original);
  memory.access.readable = false;
  withHook(
    () => memory.storage,
    (api) => {
      assert.equal(api.create(draft("Tarefa da sessão")), true);
      memory.access.readable = true;
      assert.equal(api.retrySave(), false);
      assert.equal(api.create(draft("Bloqueada após recuperação")), false);
      assert.equal(api.retrySave(), false);
      assert.equal(memory.raw(), original);
      assert.deepEqual(memory.attempts, []);

      assert.equal(api.resetInvalidStorage(), true);
      assert.deepEqual(memory.tasks(), []);
      assert.equal(api.create(draft("Lista nova")), true);
      assert.deepEqual(
        memory.tasks().map((item) => item.title),
        ["Lista nova"],
      );
    },
  );
});

test("RF06 hook: duas criações rápidas sobrevivem à falha de escrita e à nova tentativa", () => {
  const saved = [task("saved")];
  const memory = memoryStorage(envelope(saved));
  memory.access.writable = false;
  withHook(
    () => memory.storage,
    (api) => {
      assert.equal(api.storageState, "saved");
      assert.deepEqual(memory.attempts, []);
      assert.equal(api.create(draft("Primeira")), true);
      assert.equal(api.create(draft("Segunda")), true);
      assert.equal(memory.attempts.length, 2);
      assert.deepEqual(memory.tasks(), saved);

      memory.access.writable = true;
      assert.equal(api.retrySave(), true);
      const combined = memory.tasks();
      assert.deepEqual(
        combined.map((item) => item.title),
        ["Segunda", "Primeira", saved[0].title],
      );
      assert.deepEqual(combined[2], saved[0]);
      assert.equal(memory.writes.length, 1);
    },
  );
});

test("RF02–RF04 hook: editar, mover e excluir persistem campos e preservam metadados", () => {
  const first = task("first");
  const second = task("second");
  const memory = memoryStorage(envelope([first, second]));
  withHook(
    () => memory.storage,
    (api) => {
      const changes: TaskDraft = {
        title: "Título editado",
        description: "Descrição editada",
        priority: "high",
        dueDate: "2025-12-01",
      };
      assert.equal(api.update(first.id, changes), true);
      const edited = { ...first, ...changes };
      assert.deepEqual(memory.tasks(), [edited, second]);
      assert.equal(api.changeStatus(first.id, "done"), true);
      const moved: Task = { ...edited, status: "done" };
      assert.deepEqual(memory.tasks(), [moved, second]);
      assert.equal(api.remove(second.id), true);
      assert.deepEqual(memory.tasks(), [moved]);

      const writes = memory.writes.length;
      assert.equal(api.update("missing", changes), false);
      assert.equal(api.changeStatus("missing", "todo"), false);
      assert.equal(api.remove("missing"), false);
      assert.equal(memory.writes.length, writes);
      assert.equal(api.remove(first.id), true);
      assert.deepEqual(memory.tasks(), []);
    },
  );
});

test("RF06 hook: falha ao gravar reset ainda libera lista vazia em memória para retry", () => {
  const memory = memoryStorage("{invalid}");
  memory.access.writable = false;
  withHook(
    () => memory.storage,
    (api) => {
      assert.equal(api.resetInvalidStorage(), false);
      assert.equal(api.create(draft("Após reset confirmado")), true);
      assert.deepEqual(memory.writes, []);
      memory.access.writable = true;
      assert.equal(api.retrySave(), true);
      assert.deepEqual(
        memory.tasks().map((item) => item.title),
        ["Após reset confirmado"],
      );
      assert.equal(memory.writes.length, 1);
    },
  );
});
