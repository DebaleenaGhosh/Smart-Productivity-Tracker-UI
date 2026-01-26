import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskService";
import TaskModal from "../components/TaskModal";
import KanbanBoard from "../components/KanbanBoard";
import { LogOut, User, CheckCircle, AlertCircle, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

/* ===== STATUS OPTIONS (MUST MATCH BACKEND ENUM) ===== */
const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

/* ===== STATUS COLOR STYLES ===== */
const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-300",
  COMPLETED: "bg-green-100 text-green-700 border-green-300",
};

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userRole] = useState(localStorage.getItem("userRole") || "User");
  const [statusFilter, setStatusFilter] = useState("");
  const [showNavDropdown, setShowNavDropdown] = useState("");
  const navigate = useNavigate();

  /* ===== LOAD TASKS ===== */
  const loadTasks = () => {
    setLoading(true);
    getTasks().then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ===== ADD / EDIT ===== */
  const handleAdd = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSave = async (task) => {
    if (editingTask) {
      await updateTask({ ...task, taskId: editingTask.taskId });
    } else {
      await createTask(task);
    }
    setShowModal(false);
    loadTasks();
  };

  /* ===== STATUS CHANGE ===== */
  const handleStatusChange = async (task, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === task.taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await updateTask({
        ...task,
        taskId: task.taskId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update status", error);
      loadTasks(); // rollback
    }
  };

const handleLogout = async () => {
  try {
    await logout(); // 🔥 calls backend
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.replace("/?loggedOut=1");
  }
};

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          {/* Top Navigation Bar */}
          <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Productivity Tracker
            </h1>
          </div>

          {/* Header Dropdowns */}
          <div className="flex items-center gap-6">
            {/* Homepage Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition font-medium"
                onClick={() => setShowNavDropdown(showNavDropdown === 'home' ? '' : 'home')}
              >
                Homepage <ChevronDown className="w-4 h-4" />
              </button>
              {showNavDropdown === 'home' && (
                <div className="absolute left-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button onClick={() => {navigate("/dashboard"); setShowNavDropdown("");}}
                    className="block w-full text-left px-4 py-2 hover:bg-indigo-50">Dashboard</button>
                  <button onClick={() => {navigate("/"); setShowNavDropdown("");}}
                    className="block w-full text-left px-4 py-2 hover:bg-indigo-50">Login</button>
                </div>
              )}
            </div>
            {/* About Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition font-medium"
                onClick={() => setShowNavDropdown(showNavDropdown === 'about' ? '' : 'about')}
              >
                About <ChevronDown className="w-4 h-4" />
              </button>
              {showNavDropdown === 'about' && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="px-4 py-2 text-gray-700 text-sm">Smart Productivity Tracker v1.0<br/>Created by Your Team</div>
                </div>
              )}
            </div>
            {/* Task Status Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition font-medium"
                onClick={() => setShowNavDropdown(showNavDropdown === 'status' ? '' : 'status')}
              >
                Task Status <ChevronDown className="w-4 h-4" />
              </button>
              {showNavDropdown === 'status' && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button onClick={() => {setStatusFilter(""); setShowNavDropdown("");}}
                    className="block w-full text-left px-4 py-2 hover:bg-indigo-50">All</button>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {setStatusFilter(opt.value); setShowNavDropdown("");}}
                      className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
              >
                <User className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">{userRole}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Logged in as</p>
                    <p className="font-semibold text-indigo-700">{userRole}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10">
        <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-indigo-600" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Tasks
              </h1>
            </div>

            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
            >
              <span>+</span> Add Task
            </button>
          </div>

          {/* ✅ KANBAN GOES HERE */}
          <KanbanBoard
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={(id) => deleteTask(id).then(loadTasks)}
            onStatusChange={handleStatusChange}
          />

        </div>

        <TaskModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          initialData={editingTask}
        />
      </div>
        </>
      )}
    </>
  );
}


  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10">
  //     <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">
  //       {/* ===== HEADER ===== */}
  //       <div className="flex items-center justify-between mb-8">
  //         <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
  //           My Tasks
  //         </h1>

  //         <button
  //           onClick={handleAdd}
  //           className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition"
  //         >
  //           + Add Task
  //         </button>
  //       </div>

  //       ===== TABLE =====
  //       <div className="overflow-x-auto rounded-lg border">
  //         <table className="min-w-full border-collapse">
  //           <thead className="bg-gray-100">
  //             <tr>
  //               {["Title", "Description", "Priority", "Status", "Actions"].map(
  //                 (head) => (
  //                   <th
  //                     key={head}
  //                     className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase"
  //                   >
  //                     {head}
  //                   </th>
  //                 )
  //               )}
  //             </tr>
  //           </thead>

  //           <tbody>
  //             {tasks.map((task) => (
  //               <tr
  //                 key={task.taskId}
  //                 className="border-b hover:bg-indigo-50 transition"
  //               >
  //                 <td className="px-4 py-3 text-center font-medium">
  //                   {task.title}
  //                 </td>

  //                 <td className="px-4 py-3 text-center text-gray-600">
  //                   {task.description}
  //                 </td>

  //                 <td className="px-4 py-3 text-center">
  //                   <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
  //                     {task.priority}
  //                   </span>
  //                 </td>

  //                 {/* ===== STATUS DROPDOWN ===== */}
  //                 <td className="px-4 py-3 text-center">
  //                   <select
  //                     value={task.status}
  //                     onChange={(e) =>
  //                       handleStatusChange(task, e.target.value)
  //                     }
  //                     className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer
  //                       ${statusStyles[task.status]}
  //                       focus:outline-none focus:ring-2 focus:ring-indigo-500`}
  //                   >
  //                     {STATUS_OPTIONS.map((opt) => (
  //                       <option key={opt.value} value={opt.value}>
  //                         {opt.label}
  //                       </option>
  //                     ))}
  //                   </select>
  //                 </td>

  //                 {/* ===== ACTIONS ===== */}
  //                 <td className="px-4 py-3 text-center space-x-3">
  //                   <button
  //                     onClick={() => handleEdit(task)}
  //                     className="text-indigo-600 hover:underline"
  //                   >
  //                     Edit
  //                   </button>
  //                   <button
  //                     onClick={() =>
  //                       deleteTask(task.taskId).then(() => loadTasks())
  //                     }
  //                     className="text-red-600 hover:underline"
  //                   >
  //                     Delete
  //                   </button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>

  //     {/* ===== MODAL ===== */}
  //     <TaskModal
  //       isOpen={showModal}
  //       onClose={() => setShowModal(false)}
  //       onSave={handleSave}
  //       initialData={editingTask}
  //     />
  //   </div>
  // );

export default Dashboard;
