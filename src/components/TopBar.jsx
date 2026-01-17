export default function TopBar() {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        PH Paid Campaign
      </h1>

      <div className="flex gap-3">
        <input
          className="border rounded-lg px-3 py-1"
          placeholder="Search tasks"
        />
        <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
            + Add Task
        </button>
      </div>
    </div>
  );
}
