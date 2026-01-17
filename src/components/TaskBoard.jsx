import TaskGroup from "./TaskGroup";

export default function TaskBoard() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Title",
                "Assignee",
                "Due Date",
                "Priority",
                "Progress",
                "Labels"
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-gray-600 font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <TaskGroup title="To-do" />
            <TaskGroup title="In-progress" />
            <TaskGroup title="Review" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// import TaskTable from "./TaskTable";

// export default function TaskBoard({ tasks }) {
//   return (
//     <div className="p-6">
//       <TaskTable tasks={tasks} />
//     </div>
//   );
// }