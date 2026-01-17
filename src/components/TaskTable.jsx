import TaskGroup from './TaskGroup'

function TaskTable({ tasks }) {
  const grouped = tasks.reduce((acc, task) => {
    acc[task.status] = acc[task.status] || []
    acc[task.status].push(task)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-xl shadow border">
      <div className="grid grid-cols-7 px-4 py-3 text-sm font-semibold text-gray-600 border-b text-center">
        <span>Title</span>
        <span>Description</span>
        <span>Due Date</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Last Synced</span>
        <span>Actions</span>
      </div>

      {Object.entries(grouped).map(([status, tasks]) => (
        <TaskGroup key={status} status={status} tasks={tasks} />
      ))}
    </div>
  )
}

export default TaskTable

// import TaskGroup from './TaskGroup';

// function TaskTable({ tasks }) {
//   const grouped = tasks.reduce((acc, task) => {
//     acc[task.status] = acc[task.status] || [];
//     acc[task.status].push(task);
//     return acc;
//   }, {});

//   return (
//     <div className="bg-white rounded-xl shadow border">
//       {/* Table Header */}
//       <div className="grid grid-cols-7 px-4 py-3 text-sm font-semibold text-gray-600 border-b text-center">
//         <span>Title</span>
//         <span>Description</span>
//         <span>Due Date</span>
//         <span>Priority</span>
//         <span>Status</span>
//         <span>Last Synced</span>
//         <span>Actions</span>
//       </div>

//       {/* Grouped Tasks */}
//       {Object.entries(grouped).map(([status, tasks]) => (
//         <TaskGroup
//           key={status}
//           status={status}
//           tasks={tasks}   
//         />
//       ))}
//     </div>
//   );
// }

// export default TaskTable;
