import { useState } from "react";
import { getApiError } from "../utils/apiError";

const todayLocal = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const buildForm = (initialData) => ({
  title: initialData?.title ?? "",
  description: initialData?.description ?? "",
  dueDate: initialData?.dueDate ? String(initialData.dueDate).slice(0, 10) : "",
  priority: ["LOW", "MEDIUM", "HIGH"].includes(String(initialData?.priority).toUpperCase())
    ? String(initialData.priority).toUpperCase()
    : "LOW",
  category: initialData?.category ?? "",
  estimatedMinutes: initialData?.estimatedMinutes ?? "",
  actualMinutes: initialData?.actualMinutes ?? "",
});

const inputClass = "w-full border p-2 rounded";

// The form is keyed by the parent, so state resets each time the modal opens.
function TaskForm({ onClose, onSave, initialData }) {
  const [task, setTask] = useState(() => buildForm(initialData));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData);

  const handleChange = (e) => {
    setTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await onSave({ ...(initialData || {}), ...task });
    } catch (err) {
      setError(getApiError(err, "Unable to save the task. Please try again."));
      setPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black bg-opacity-40 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Task" : "Add Task"}
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Task" : "Add Task"}</h2>

        {error && (
          <div role="alert" className="mb-3 rounded border border-red-300 bg-red-100 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            aria-label="Title"
            maxLength={150}
            value={task.title}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            aria-label="Description"
            maxLength={1000}
            value={task.description}
            onChange={handleChange}
            className={inputClass}
          />

          <label className="block text-sm text-gray-600">
            Due date
            <input
              type="date"
              name="dueDate"
              min={isEdit ? undefined : todayLocal()}
              value={task.dueDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </label>

          <select
            name="priority"
            aria-label="Priority"
            value={task.priority}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <input
            name="category"
            placeholder="Category (e.g. WORK)"
            aria-label="Category"
            maxLength={60}
            value={task.category}
            onChange={handleChange}
            className={inputClass}
          />

          <label className="block text-sm text-gray-600">
            Estimated time (minutes) - how long you expect it to take
            <input
              type="number"
              name="estimatedMinutes"
              placeholder="e.g. 60 (1-10080)"
              min={1}
              max={10080}
              step={1}
              value={task.estimatedMinutes}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          {isEdit && (
            <label className="block text-sm text-gray-600">
              Time spent (minutes) - how long it actually took
              <input
                type="number"
                name="actualMinutes"
                placeholder="e.g. 45 (0-10080)"
                min={0}
                max={10080}
                step={1}
                value={task.actualMinutes}
                onChange={handleChange}
                className={inputClass}
              />
            </label>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskModal({ isOpen, onClose, onSave, initialData }) {
  if (!isOpen) return null;
  return (
    <TaskForm
      key={initialData?.taskId ?? "new"}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
}

export default TaskModal;



// export default function AddTaskModal({ onSave, onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-xl w-96">
//         <h2 className="text-xl font-bold mb-4">Add Task</h2>

//         <input className="border w-full mb-3 p-2" placeholder="Title" />
//         <textarea className="border w-full mb-3 p-2" placeholder="Description" />

//         <button
//           onClick={onSave}
//           className="bg-indigo-600 text-white px-4 py-2 rounded"
//         >
//           Save
//         </button>

//         <button
//           onClick={onClose}
//           className="ml-3 text-gray-600"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// }