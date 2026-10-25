function priorityStyle(priority) {
  if (priority === 'HIGH') return 'bg-red-100 text-red-600'
  if (priority === 'MEDIUM') return 'bg-yellow-100 text-yellow-600'
  return 'bg-green-100 text-green-600'
}

function TaskRow({ task, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-7 px-4 py-3 text-sm border-b hover:bg-gray-50">
      <div className="font-medium">{task.title}</div>

      <div className="text-gray-500 truncate">
        {task.description}
      </div>

      <div>{task.dueDate}</div>

      <div>
        <span className={`px-2 py-1 rounded-full text-xs ${priorityStyle(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="capitalize">{task.status}</div>

      <div className="text-xs text-gray-400">
        {task.lastSynced}
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={() => onEdit?.(task)} className="text-blue-600 hover:text-blue-800">✏️</button>
        <button onClick={() => onDelete?.(task.taskId)} className="text-red-600 hover:text-red-800">🗑️</button>
      </div>
    </div>
  )
}

export default TaskRow


// export default function TaskRow({ task }) {
//   return (
//     <div className="grid grid-cols-7 px-4 py-3 border-b items-center text-center text-sm hover:bg-gray-50">
//       <span className="font-medium text-gray-800">{task.title}</span>
//       <span className="text-gray-600">{task.description}</span>
//       <span>{task.dueDate}</span>
//       <span className="font-semibold">{task.priority}</span>
//       <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">
//         {task.status}
//       </span>
//       <span className="text-xs text-gray-500">{task.lastSynced}</span>

//       {/* Actions */}
//       <div className="flex justify-center gap-3">
//         <button className="text-blue-600 hover:text-blue-800">✏️</button>
//         <button className="text-red-600 hover:text-red-800">🗑️</button>
//       </div>
//     </div>
//   );
// }