import assert from "node:assert/strict";
import test from "node:test";
import {
  loadTasks,
  saveTasks,
  STORAGE_KEY,
  type TaskStorage,
} from "../src/taskStorage";
import { type Task } from "../src/task";

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Persistir tarefa",
    description: "Uma descrição",
    priority: "medium",
    dueDate: "2026-10-12",
    status: "doing",
    createdAt: "2026-10-12T18:00:00.000Z",
    ...overrides,
  };
}

function memoryStorage(initial: string | null = null) {
  let value = initial;
  const writes: string[] = [];
  const storage: TaskStorage = {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, raw) {
      assert.equal(key, STORAGE_KEY);
      writes.push(raw);
      value = raw;
    },
  };
  return { storage, writes, read: () => value };
}

test("RF06: armazenamento ausente retorna lista vazia sem escrever", () => {
  const { storage, writes } = memoryStorage();
  assert.deepEqual(loadTasks(storage), { status: "empty", tasks: [] });
  assert.deepEqual(writes, []);
});

test("RF06: envelope com lista vazia é válido e permanece vazio ao reabrir", () => {
  const { storage, writes } = memoryStorage();
  assert.equal(saveTasks(storage, []), true);
  assert.deepEqual(JSON.parse(writes[0]), { version: 1, tasks: [] });
  assert.deepEqual(loadTasks(storage), { status: "ready", tasks: [] });
  assert.equal(writes.length, 1);
});

test("RF06: roundtrip preserva todos os campos e a ordem sem incluir filtros", () => {
  const { storage, writes } = memoryStorage();
  const tasks = [
    task({ id: "newer", status: "done", priority: "high" }),
    task({ description: "", dueDate: "2024-02-29" }),
  ];
  assert.equal(saveTasks(storage, tasks), true);
  assert.deepEqual(JSON.parse(writes[0]), { version: 1, tasks });
  assert.deepEqual(loadTasks(storage), { status: "ready", tasks });
  assert.equal(writes.length, 1);
});

const invalidEnvelopes: Record<string, unknown> = {
  null: null,
  "array no lugar do envelope": [],
  "sem versão": { tasks: [] },
  "versão futura": { version: 2, tasks: [] },
  "versão com tipo incorreto": { version: "1", tasks: [] },
  "sem lista": { version: 1 },
  "lista com tipo incorreto": { version: 1, tasks: {} },
  "tarefa nula": { version: 1, tasks: [null] },
  "ids duplicados": { version: 1, tasks: [task(), task()] },
};

for (const [name, envelope] of Object.entries(invalidEnvelopes)) {
  test(`RF06: ${name} é rejeitado sem substituir os dados`, () => {
    const original = JSON.stringify(envelope);
    const { storage, writes, read } = memoryStorage(original);
    assert.deepEqual(loadTasks(storage), { status: "invalid", tasks: [] });
    assert.deepEqual(writes, []);
    assert.equal(read(), original);
  });
}

test("RF06: JSON malformado permanece intacto após leitura", () => {
  for (const original of ["{not json}", "", "undefined"]) {
    const { storage, writes, read } = memoryStorage(original);
    assert.deepEqual(loadTasks(storage), { status: "invalid", tasks: [] });
    assert.deepEqual(writes, []);
    assert.equal(read(), original);
  }
});

const invalidFields: Record<string, Record<string, unknown>> = {
  "id vazio": { id: " " },
  "id não textual": { id: 3 },
  "título vazio": { title: " " },
  "título fora do limite": { title: "x".repeat(101) },
  "título não normalizado": { title: " Tarefa " },
  "descrição fora do limite": { description: "x".repeat(501) },
  "descrição não textual": { description: null },
  "prioridade inválida": { priority: "urgent" },
  "estado inválido": { status: "cancelled" },
  "prazo inexistente": { dueDate: "2026-02-29" },
  "prazo não textual": { dueDate: false },
  "criação sem horário": { createdAt: "2026-10-12" },
  "criação inexistente": { createdAt: "2026-02-30T18:00:00.000Z" },
  "horário inexistente": { createdAt: "2026-10-12T24:00:00.000Z" },
  "criação não textual": { createdAt: null },
};

for (const [name, fields] of Object.entries(invalidFields)) {
  test(`RF06: tarefa com ${name} é rejeitada sem escrita`, () => {
    const original = JSON.stringify({
      version: 1,
      tasks: [{ ...task(), ...fields }],
    });
    const { storage, writes, read } = memoryStorage(original);
    assert.deepEqual(loadTasks(storage), { status: "invalid", tasks: [] });
    assert.deepEqual(writes, []);
    assert.equal(read(), original);
  });
}

test("RF06: campo obrigatório ausente invalida a tarefa inteira", () => {
  for (const field of Object.keys(task())) {
    const incomplete: Record<string, unknown> = { ...task() };
    delete incomplete[field];
    const { storage, writes } = memoryStorage(
      JSON.stringify({ version: 1, tasks: [incomplete] }),
    );
    assert.deepEqual(
      loadTasks(storage),
      { status: "invalid", tasks: [] },
      field,
    );
    assert.deepEqual(writes, []);
  }
});

test("RF06: falha de leitura retorna unavailable e falha de escrita retorna false", () => {
  const storage: TaskStorage = {
    getItem() {
      throw new Error("Access denied");
    },
    setItem() {
      throw new Error("Quota exceeded");
    },
  };
  assert.deepEqual(loadTasks(storage), { status: "unavailable", tasks: [] });
  assert.equal(saveTasks(storage, [task()]), false);
});

test("RF06: salvar dados inválidos retorna false antes de alterar o armazenamento", () => {
  const original = JSON.stringify({ version: 1, tasks: [task()] });
  const { storage, writes, read } = memoryStorage(original);
  assert.equal(saveTasks(storage, [task({ dueDate: "2026-04-31" })]), false);
  assert.equal(saveTasks(storage, [task(), task()]), false);
  assert.equal(saveTasks(storage, null as unknown as Task[]), false);
  assert.deepEqual(writes, []);
  assert.equal(read(), original);
});
