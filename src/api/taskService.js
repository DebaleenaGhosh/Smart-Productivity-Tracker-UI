import axiosInstance from "./axiosInstance";

const toNumberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const clean = (value) => {
  const text = typeof value === "string" ? value.trim() : value;
  return text === "" ? undefined : text;
};

// Whitelist request fields so response-only values (timestamps, lastSynced) are never sent.
const buildCreatePayload = (task) => ({
  title: clean(task.title),
  description: clean(task.description),
  dueDate: clean(task.dueDate),
  priority: String(task.priority || "LOW").toUpperCase(),
  category: clean(task.category),
  estimatedMinutes: toNumberOrUndefined(task.estimatedMinutes),
});

const buildUpdatePayload = (task) => ({
  taskId: task.taskId,
  title: clean(task.title),
  description: clean(task.description),
  dueDate: clean(task.dueDate),
  priority: String(task.priority || "LOW").toUpperCase(),
  status: task.status || "PENDING",
  category: clean(task.category),
  estimatedMinutes: toNumberOrUndefined(task.estimatedMinutes),
  actualMinutes: toNumberOrUndefined(task.actualMinutes),
});

export const getTasks = () => axiosInstance.get("/tasks");

export const createTask = (task) =>
  axiosInstance.post("/tasks", buildCreatePayload(task));

export const updateTask = (task) =>
  axiosInstance.put(`/tasks/${encodeURIComponent(task.taskId)}`, buildUpdatePayload(task));

export const deleteTask = (taskId) =>
  axiosInstance.delete(`/tasks/${encodeURIComponent(taskId)}`);