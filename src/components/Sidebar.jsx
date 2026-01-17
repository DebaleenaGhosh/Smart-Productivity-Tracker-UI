export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r p-4">
      <h2 className="text-xl font-bold mb-6 text-indigo-600">
        Task Manager
      </h2>

      <nav className="space-y-3 text-gray-600">
        <p className="font-semibold text-gray-400 uppercase text-xs">Projects</p>
        <button className="block w-full text-left hover:text-indigo-600">
          📋 Tasks
        </button>
        <button className="block w-full text-left hover:text-indigo-600">
          📅 Calendar
        </button>
        <button className="block w-full text-left hover:text-indigo-600">
          📊 Reports
        </button>
      </nav>
    </div>
  );
}