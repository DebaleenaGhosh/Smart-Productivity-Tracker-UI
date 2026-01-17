import { useState, useEffect } from "react";

function TaskModal({ isOpen, onClose, onSave, initialData }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",
    status: "PENDING",
  });

  useEffect(() => {
    if (initialData) {
      setTask(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(task);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Task" : "Add Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            value={task.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={task.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
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