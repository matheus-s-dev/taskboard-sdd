import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "../../src/App";
import { STORAGE_KEY, type TaskStorage } from "../../src/taskStorage";
import type { Task } from "../../src/task";
import "../../src/styles.css";

// Dev-only fixture: this page never reads or writes the browser's real storage.
const fixture: Task = {
  id: "saved-fixture",
  title: "Preparar apresentação SDD",
  description: "Tarefa sintética para conferir a recuperação dos dados.",
  priority: "high",
  dueDate: "2026-10-15",
  status: "doing",
  createdAt: "2026-10-12T18:00:00.000Z",
};
const validRaw = JSON.stringify({ version: 1, tasks: [fixture] });
const invalidRaw = "{dados-simulados-invalidos}";
let raw: string | null = validRaw;
let readBlocked = false;
let writeBlocked = false;
let writes = 0;
let root: Root | undefined;

const toolbar = document.getElementById("validation-controls")!;
toolbar.style.cssText =
  "padding:16px;background:#fff;border-bottom:2px solid #7159c1;position:relative;z-index:1";
const heading = document.createElement("h2");
heading.textContent = "Ambiente de validação — armazenamento simulado";
heading.style.cssText = "font-size:18px;margin:0 0 10px";
toolbar.append(heading);
const controls = document.createElement("div");
controls.style.cssText =
  "display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px";
toolbar.append(controls);
const status = document.createElement("p");
status.setAttribute("role", "status");
status.style.cssText = "margin:8px 0";
toolbar.append(status);
const label = document.createElement("label");
label.htmlFor = "simulated-storage";
label.textContent = "Conteúdo do armazenamento simulado";
toolbar.append(label);
const snapshot = document.createElement("textarea");
snapshot.id = "simulated-storage";
snapshot.readOnly = true;
snapshot.rows = 2;
snapshot.style.cssText =
  "display:block;width:100%;margin-top:5px;font-size:12px";
toolbar.append(snapshot);

function showState() {
  status.textContent = `Leitura: ${readBlocked ? "bloqueada" : "liberada"} · Gravação: ${writeBlocked ? "bloqueada" : "liberada"} · Gravações concluídas: ${writes}`;
  snapshot.value = raw ?? "(sem dados)";
}

const storage: TaskStorage = {
  getItem(key) {
    if (key !== STORAGE_KEY) return null;
    if (readBlocked) throw new Error("Falha de leitura simulada");
    return raw;
  },
  setItem(key, value) {
    if (key !== STORAGE_KEY) throw new Error("Chave inesperada");
    if (writeBlocked) throw new Error("Falha de gravação simulada");
    raw = value;
    writes += 1;
    showState();
  },
};
Object.defineProperty(window, "localStorage", {
  configurable: true,
  get: () => storage,
});

function mount() {
  root?.unmount();
  root = createRoot(document.getElementById("app-test-root")!);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  showState();
}

function scenario(value: string, blockRead = false, blockWrite = false) {
  raw = value;
  readBlocked = blockRead;
  writeBlocked = blockWrite;
  writes = 0;
  mount();
}

function control(text: string, action: () => void) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = "secondary-button";
  button.addEventListener("click", action);
  controls.append(button);
}

control("Carregar dados válidos", () => scenario(validRaw));
control("Carregar JSON inválido", () => scenario(invalidRaw));
control("Simular falha de leitura", () => scenario(validRaw, true));
control("Simular falha de gravação", () => scenario(validRaw, false, true));
control("Liberar leitura", () => {
  readBlocked = false;
  showState();
});
control("Liberar gravação", () => {
  writeBlocked = false;
  showState();
});
control("Corromper dados simulados", () => {
  raw = invalidRaw;
  showState();
});
mount();
