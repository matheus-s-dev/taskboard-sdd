import assert from "node:assert/strict";
import test from "node:test";
import {
  addTask,
  changeTaskStatus,
  isCalendarDate,
  removeTask,
  statuses,
  TaskValidationError,
  updateTask,
  validateTaskDraft,
  type Task,
  type TaskDraft,
  type TaskStatus,
} from "../src/task";

const draft: TaskDraft = {
  title: "Uma tarefa",
  description: "Detalhes da tarefa",
  priority: "medium",
  dueDate: "2026-10-12",
};

function task(overrides: Partial<Task> = {}): Task {
  return {
    ...draft,
    id: "task-1",
    status: "doing",
    createdAt: "2026-10-08T16:00:00.000Z",
    ...overrides,
  };
}

test("RF01: aceita título de 1 a 100 caracteres após trim e descrição até 500", () => {
  assert.deepEqual(validateTaskDraft({ ...draft, title: " x " }), {});
  assert.deepEqual(
    validateTaskDraft({
      ...draft,
      title: `  ${"x".repeat(100)}  `,
      description: "x".repeat(500),
    }),
    {},
  );
  assert.deepEqual(
    validateTaskDraft({ ...draft, description: "", dueDate: "" }),
    {},
  );
  assert.ok(validateTaskDraft({ ...draft, title: "x".repeat(101) }).title);
  assert.ok(validateTaskDraft({ ...draft, title: " \n\t " }).title);
  assert.ok(
    validateTaskDraft({ ...draft, description: "x".repeat(501) }).description,
  );
});

test("RF01: valida os tipos em tempo de execução e apresenta erros por campo", () => {
  const errors = validateTaskDraft({
    title: 8,
    description: null,
    priority: "urgent",
    dueDate: false,
  } as unknown as TaskDraft);
  assert.deepEqual(Object.keys(errors).sort(), [
    "description",
    "dueDate",
    "priority",
    "title",
  ]);
  assert.deepEqual(
    Object.keys(validateTaskDraft(null as unknown as TaskDraft)).sort(),
    Object.keys(errors).sort(),
  );
});

test("RF01: prazo aceita datas passadas e verifica o calendário, incluindo anos bissextos", () => {
  for (const valid of [
    "2024-02-29",
    "2000-02-29",
    "2020-01-01",
    "0001-01-01",
    "9999-12-31",
  ]) {
    assert.ok(isCalendarDate(valid), valid);
    assert.deepEqual(validateTaskDraft({ ...draft, dueDate: valid }), {});
  }
  for (const invalid of [
    "2026-02-29",
    "1900-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-10-00",
    "0000-01-01",
    "2026-2-01",
    "2026-10-12T12:00:00Z",
  ]) {
    assert.equal(isCalendarDate(invalid), false, invalid);
    assert.ok(
      validateTaskDraft({ ...draft, dueDate: invalid }).dueDate,
      invalid,
    );
  }
});

test("RF01: criação normaliza título, inicia em A fazer e preserva a lista anterior", () => {
  const existing = Object.freeze(task());
  const before = Object.freeze([existing]);
  const metadata = { id: "task-2", createdAt: "2026-10-12T18:00:00.000Z" };
  const result = addTask(
    before,
    { ...draft, title: "  Nova tarefa  " },
    metadata,
  );
  assert.notEqual(result, before);
  assert.deepEqual(result[0], {
    ...draft,
    title: "Nova tarefa",
    ...metadata,
    status: "todo",
  });
  assert.equal(result[1], existing);
  assert.equal(before.length, 1);
});

test("RF01: entradas inválidas não criam tarefas nem alteram a lista", () => {
  const before = Object.freeze([Object.freeze(task())]);
  assert.throws(
    () =>
      addTask(
        before,
        { ...draft, title: " " },
        { id: "task-2", createdAt: "2026-10-12T18:00:00.000Z" },
      ),
    (error: unknown) =>
      error instanceof TaskValidationError && Boolean(error.errors.title),
  );
  assert.throws(
    () =>
      addTask(before, draft, {
        id: "task-1",
        createdAt: "2026-10-12T18:00:00.000Z",
      }),
    /identificador/,
  );
  assert.throws(
    () =>
      addTask(before, draft, {
        id: " ",
        createdAt: "2026-10-12T18:00:00.000Z",
      }),
    /criação/,
  );
  assert.throws(
    () =>
      addTask(before, draft, {
        id: "task-2",
        createdAt: "2026-02-30T18:00:00.000Z",
      }),
    /criação/,
  );
  assert.throws(
    () =>
      addTask(before, draft, null as unknown as Pick<Task, "id" | "createdAt">),
    /criação/,
  );
  assert.deepEqual(before, [task()]);
});

test("RF02/RF05: edição preserva identidade, estado, data de criação, ordem e outras tarefas", () => {
  const before = Object.freeze([
    Object.freeze(task({ id: "newer", createdAt: "2026-10-12T18:00:00.000Z" })),
    Object.freeze(task()),
  ]);
  const changed = {
    ...draft,
    title: "  Editada  ",
    description: "Outro detalhe",
    priority: "high" as const,
    dueDate: "",
  };
  // Only editable fields are copied, even if runtime input carries extra fields.
  const result = updateTask(before, "task-1", {
    ...changed,
    id: "forged",
    status: "done",
    createdAt: "2026-10-12T19:00:00.000Z",
  } as TaskDraft);
  assert.notEqual(result, before);
  assert.equal(result[0], before[0]);
  assert.deepEqual(result[1], { ...before[1], ...changed, title: "Editada" });
  assert.deepEqual(before[1], task());
  assert.throws(
    () =>
      updateTask(before, "task-1", { ...draft, description: "x".repeat(501) }),
    TaskValidationError,
  );
});

test("RF03: qualquer estado pode mudar para qualquer outro sem alterar os outros campos", () => {
  for (const from of statuses) {
    for (const to of statuses) {
      const original = Object.freeze(task({ status: from }));
      const before = Object.freeze([
        original,
        Object.freeze(task({ id: "other" })),
      ]);
      const result = changeTaskStatus(before, "task-1", to);
      assert.notEqual(result, before);
      assert.deepEqual(result[0], { ...original, status: to });
      assert.equal(result[1], before[1]);
      assert.equal(original.status, from);
    }
  }
  assert.throws(
    () => changeTaskStatus([task()], "task-1", "invalid" as TaskStatus),
    /estado/,
  );
});

test("RF04: exclusão remove somente a tarefa escolhida sem modificar a entrada", () => {
  const before = Object.freeze([
    Object.freeze(task()),
    Object.freeze(task({ id: "other" })),
  ]);
  const result = removeTask(before, "task-1");
  assert.deepEqual(result, [before[1]]);
  assert.equal(result[0], before[1]);
  assert.equal(before.length, 2);
});

test("operações rejeitam identificador ausente e listas inválidas", () => {
  const before = [task()];
  assert.throws(() => updateTask(before, "missing", draft), /não encontrada/);
  assert.throws(
    () => changeTaskStatus(before, "missing", "done"),
    /não encontrada/,
  );
  assert.throws(() => removeTask(before, "missing"), /não encontrada/);
  assert.throws(() => removeTask(before, " "), /não encontrada/);
  const duplicateIds = [task(), task()];
  assert.throws(() => removeTask(duplicateIds, "task-1"), /lista/);
  assert.throws(
    () =>
      addTask(null as unknown as Task[], draft, {
        id: "new",
        createdAt: "2026-10-12T18:00:00.000Z",
      }),
    /lista/,
  );
});
