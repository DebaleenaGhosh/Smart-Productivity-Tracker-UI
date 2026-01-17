import TaskRow from './TaskRow'

function TaskGroup({ status, tasks, onEdit, onDelete, onToggle }) {
  return (
    <>
      <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
        {status} ({tasks.length})
      </div>

      {tasks.map(task => (
        <TaskRow 
          key={task.taskId} 
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </>
  )
}

export default TaskGroup

// import TaskRow from "./TaskRow";

// export default function TaskGroup({ status, tasks = [] }) {
//   return (
//     <div>
//       {/* Group Header */}
//       <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-t">
//         {status}
//       </div>

//       {tasks.map(task => (
//         <TaskRow key={task.taskId} task={task} />
//       ))}
//     </div>
//   );
// }