import assert from "node:assert/strict";
import test from "node:test";
import { persistTaskSnapshot } from "../src/taskRecovery";
import type { Task } from "../src/task";
import { STORAGE_KEY, type TaskStorage } from "../src/taskStorage";

function task(id: string, title = id): Task {
  return {
    id,
    title,
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
    createdAt: "2026-10-12T18:00:00.000Z",
  };
}

function memoryStorage(initial: string | null = null) {
  let value = initial;
  let readable = true;
  let writable = true;
  const writes: string[] = [];
  const storage: TaskStorage = {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      if (!readable) throw new Error("Read denied");
      return value;
    },
    setItem(key, raw) {
      assert.equal(key, STORAGE_KEY);
      if (!writable) throw new Error("Write denied");
      writes.push(raw);
      value = raw;
    },
  };
  return {
    storage,
    writes,
    read: () => value,
    blockReads: () => {
      readable = false;
    },
    allowReads: () => {
      readable = true;
    },
    blockWrites: () => {
      writable = false;
    },
    allowWrites: () => {
      writable = true;
    },
  };
}

function envelope(tasks: Task[]) {
  return JSON.stringify({ version: 1, tasks });
}

test("RF06: getter indisponível mantém tarefas da sessão sem marcar leitura concluída", () => {
  const session = [task("session")];
  assert.deepEqual(persistTaskSnapshot(null, session, true), {
    tasks: session,
    storageState: "unsaved",
    needsRead: true,
  });
});

test("RF06: leitura ainda bloqueada nunca escreve sobre um quadro desconhecido", () => {
  const original = envelope([task("saved")]);
  const memory = memoryStorage(original);
  memory.blockReads();
  for (const session of [[], [task("session")]]) {
    assert.deepEqual(persistTaskSnapshot(memory.storage, session, true), {
      tasks: session,
      storageState: "unsaved",
      needsRead: true,
    });
  }
  assert.deepEqual(memory.writes, []);
  assert.equal(memory.read(), original);
});

test("RF06: recuperação após falha de leitura restaura quadro existente sem escrever lista vazia", () => {
  const saved = [task("saved")];
  const original = envelope(saved);
  const memory = memoryStorage(original);
  memory.blockReads();
  const blocked = persistTaskSnapshot(memory.storage, [], true);
  memory.allowReads();
  assert.deepEqual(
    persistTaskSnapshot(memory.storage, blocked.tasks, blocked.needsRead),
    { tasks: saved, storageState: "saved", needsRead: false },
  );
  assert.deepEqual(memory.writes, []);
  assert.equal(memory.read(), original);
});

test("RF06: recuperação combina o quadro existente com todas as tarefas da sessão", () => {
  const saved = [task("saved-a"), task("saved-b")];
  const session = [task("session-a"), task("session-b")];
  const memory = memoryStorage(envelope(saved));
  memory.blockReads();
  const blocked = persistTaskSnapshot(memory.storage, session, true);
  assert.deepEqual(memory.writes, []);
  memory.allowReads();
  const result = persistTaskSnapshot(
    memory.storage,
    blocked.tasks,
    blocked.needsRead,
  );
  assert.deepEqual(result, {
    tasks: [...session, ...saved],
    storageState: "saved",
    needsRead: false,
  });
  assert.deepEqual(JSON.parse(memory.read()!), {
    version: 1,
    tasks: [...session, ...saved],
  });
  assert.equal(memory.writes.length, 1);
});

test("RF06: recuperação mantém o registro salvo se houver colisão de identificador", () => {
  const saved = [task("same", "Título já salvo")];
  const session = [task("same", "Título da sessão"), task("fresh")];
  const memory = memoryStorage(envelope(saved));
  const result = persistTaskSnapshot(memory.storage, session, true);
  assert.deepEqual(result.tasks, [session[1], saved[0]]);
  assert.deepEqual(JSON.parse(memory.read()!).tasks, [session[1], saved[0]]);
});

test("RF06: dados inválidos descobertos na recuperação ficam intactos e preservam tarefas da sessão", () => {
  for (const original of [
    "{invalid}",
    JSON.stringify({ version: 2, tasks: [] }),
  ]) {
    const memory = memoryStorage(original);
    const session = [task("session")];
    assert.deepEqual(persistTaskSnapshot(memory.storage, session, true), {
      tasks: session,
      storageState: "invalid",
      needsRead: false,
    });
    assert.deepEqual(memory.writes, []);
    assert.equal(memory.read(), original);
  }
});

test("RF06: recuperação de armazenamento vazio salva as tarefas da sessão", () => {
  const memory = memoryStorage();
  const session = [task("session")];
  assert.deepEqual(persistTaskSnapshot(memory.storage, session, true), {
    tasks: session,
    storageState: "saved",
    needsRead: false,
  });
  assert.deepEqual(JSON.parse(memory.read()!), { version: 1, tasks: session });
  assert.equal(memory.writes.length, 1);
});

test("RF06: recuperação de armazenamento vazio sem mudanças não escreve", () => {
  const memory = memoryStorage();
  assert.deepEqual(persistTaskSnapshot(memory.storage, [], true), {
    tasks: [],
    storageState: "saved",
    needsRead: false,
  });
  assert.deepEqual(memory.writes, []);
  assert.equal(memory.read(), null);
});

test("RF06: falha de escrita depois da recuperação mantém os registros combinados para nova tentativa", () => {
  const saved = [task("saved")];
  const session = [task("session")];
  const memory = memoryStorage(envelope(saved));
  memory.blockWrites();
  const failed = persistTaskSnapshot(memory.storage, session, true);
  assert.deepEqual(failed, {
    tasks: [...session, ...saved],
    storageState: "unsaved",
    needsRead: false,
  });
  assert.deepEqual(memory.writes, []);
  memory.allowWrites();
  assert.deepEqual(
    persistTaskSnapshot(memory.storage, failed.tasks, failed.needsRead),
    { tasks: [...session, ...saved], storageState: "saved", needsRead: false },
  );
  assert.equal(memory.writes.length, 1);
});

test("RF06: falha de escrita de quadro já lido não recupera dados antigos sobre a memória atual", () => {
  const memory = memoryStorage(envelope([task("old")]));
  const current = [task("new")];
  memory.blockWrites();
  const failed = persistTaskSnapshot(memory.storage, current, false);
  assert.equal(failed.storageState, "unsaved");
  memory.allowWrites();
  const result = persistTaskSnapshot(
    memory.storage,
    failed.tasks,
    failed.needsRead,
  );
  assert.deepEqual(result, {
    tasks: current,
    storageState: "saved",
    needsRead: false,
  });
  assert.deepEqual(JSON.parse(memory.read()!).tasks, current);
});
