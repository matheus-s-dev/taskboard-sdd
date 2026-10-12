import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import App from "../src/App";
import type { Task } from "../src/task";
import { STORAGE_KEY, type TaskStorage } from "../src/taskStorage";

function renderWithStorage(getStorage: () => TaskStorage): string {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const mockWindow = Object.defineProperty({}, "localStorage", {
    get: getStorage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: mockWindow,
  });
  try {
    return renderToString(createElement(App));
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

function memoryStorage(initial: string | null) {
  let raw = initial;
  const writes: string[] = [];
  const storage: TaskStorage = {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return raw;
    },
    setItem(key, nextRaw) {
      assert.equal(key, STORAGE_KEY);
      writes.push(nextRaw);
      raw = nextRaw;
    },
  };
  return { storage, writes, read: () => raw };
}

function newTaskButton(html: string): string {
  const button = html.match(
    /<button\b[^>]*class="primary-button new-task"[^>]*>/,
  )?.[0];
  assert.ok(button, "O controle Nova tarefa deve ser apresentado.");
  return button;
}

test("RF06: JSON inválido mostra recuperação, bloqueia criação e preserva os dados", () => {
  const original = "{not json}";
  const { storage, writes, read } = memoryStorage(original);
  const html = renderWithStorage(() => storage);

  assert.ok(html.includes("Não foi possível ler as tarefas salvas."));
  assert.ok(html.includes("Os dados existentes foram preservados."));
  assert.ok(html.includes("Iniciar lista vazia"));
  assert.match(newTaskButton(html), /\bdisabled=""/);
  assert.deepEqual(writes, []);
  assert.equal(read(), original);
});

test("RF06: getter indisponível mostra aviso de sessão e permite criar tarefas", () => {
  const html = renderWithStorage(() => {
    throw new Error("Storage access denied");
  });

  assert.ok(html.includes("As alterações estão apenas nesta sessão."));
  assert.ok(
    html.includes("As mudanças podem se perder ao atualizar ou fechar"),
  );
  assert.doesNotMatch(newTaskButton(html), /\bdisabled(?:=|\s|>)/);
});

for (const [name, original] of [
  ["chave ausente", null],
  ["lista vazia válida", JSON.stringify({ version: 1, tasks: [] })],
] as const) {
  test(`RF06: ${name} mostra salvamento local sem escrever na inicialização`, () => {
    const { storage, writes, read } = memoryStorage(original);
    const html = renderWithStorage(() => storage);

    assert.ok(html.includes("Seu quadro fica aqui."));
    assert.ok(html.includes("SALVAMENTO LOCAL"));
    assert.ok(html.includes("Espaço livre para começar."));
    assert.doesNotMatch(newTaskButton(html), /\bdisabled(?:=|\s|>)/);
    assert.deepEqual(writes, []);
    assert.equal(read(), original);
  });
}

test("RF06: tarefa persistida aparece no quadro com aviso de salvamento e sem escrita inicial", () => {
  const task: Task = {
    id: "persisted-1",
    title: "Conferir tarefa persistida",
    description: "Dados que já estavam neste navegador.",
    priority: "high",
    dueDate: "2026-10-12",
    status: "doing",
    createdAt: "2026-10-12T18:00:00.000Z",
  };
  const original = JSON.stringify({ version: 1, tasks: [task] });
  const { storage, writes, read } = memoryStorage(original);
  const html = renderWithStorage(() => storage);

  assert.ok(
    html.includes('<h3 id="task-persisted-1">Conferir tarefa persistida</h3>'),
  );
  assert.ok(html.includes(task.description));
  assert.ok(html.includes("Seu quadro fica aqui."));
  assert.ok(html.includes("SALVAMENTO LOCAL"));
  assert.doesNotMatch(newTaskButton(html), /\bdisabled(?:=|\s|>)/);
  assert.deepEqual(writes, []);
  assert.equal(read(), original);
});
