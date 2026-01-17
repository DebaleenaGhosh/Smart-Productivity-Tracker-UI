import React from "react";
import { AlertCircle, Flag, AlertOctagon } from "lucide-react";

/* Status mapping (MUST MATCH BACKEND ENUM) */
const COLUMNS = [
  {
    title: "Pending",
    status: "PENDING",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
  },
  {
    title: "In Progress",
    status: "IN_PROGRESS",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  {
    title: "Completed",
    status: "COMPLETED",
    bg: "bg-green-50",
    border: "border-green-300",
  },
];

/* Priority mapping with colors and labels */
const PRIORITY_CONFIG = {
  HIGH: {
    label: "High Priority",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: AlertOctagon,
  },
  MEDIUM: {
    label: "Medium Priority",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Flag,
  },
  LOW: {
    label: "Low Priority",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: AlertCircle,
  },
};

export default function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((col) => (
        <div
          key={col.status}
          className={`rounded-xl border ${col.border} ${col.bg} p-4`}
        >
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">
            {col.title}
          </h2>

          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === col.status)
              .map((task) => (
                <div
                  key={task.taskId}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-800">
                    {task.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {(() => {
                      const config = PRIORITY_CONFIG[task.priority?.toUpperCase()] || PRIORITY_CONFIG.LOW;
                      const IconComponent = config.icon;
                      return (
                        <span className={`text-xs px-3 py-1 rounded-full ${config.bg} ${config.text} font-semibold flex items-center gap-1`}>
                          <IconComponent className="w-3 h-3" />
                          {config.label}
                        </span>
                      );
                    })()}

                    <select
                      value={task.status}
                      onChange={(e) =>
                        onStatusChange(task, e.target.value)
                      }
                      className="text-xs border rounded px-2 py-1 cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 mt-3 text-sm">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(task.taskId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

            {/* Empty state */}
            {tasks.filter((t) => t.status === col.status).length === 0 && (
              <p className="text-center text-sm text-gray-400">
                No tasks
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
