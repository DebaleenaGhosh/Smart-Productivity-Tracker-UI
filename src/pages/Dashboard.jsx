import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskService";
import TaskModal from "../components/TaskModal";
import KanbanBoard from "../components/KanbanBoard";
import Insights from "../components/Insights";
import { LogOut, User, CheckCircle, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { getSession } from "../utils/session";
import { getApiError } from "../utils/apiError";

/* ===== STATUS OPTIONS (MUST MATCH BACKEND ENUM) ===== */
const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingIds, setPendingIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [session] = useState(() => getSession());
  const [statusFilter, setStatusFilter] = useState("");
  const [showNavDropdown, setShowNavDropdown] = useState("");
  const [view, setView] = useState("tasks");
  const [insightsRevision, setInsightsRevision] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  const userRole = session?.role || "USER";
  const userName = session?.sub || "User";

  /* ===== LOAD TASKS ===== */
  useEffect(() => {
    let active = true;
    getTasks()
      .then((res) => {
        if (!active) return;
        setTasks(Array.isArray(res.data) ? res.data : []);
        setLoadError("");
      })
      .catch((err) => {
        if (active) setLoadError(getApiError(err, "Unable to load tasks."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const markPending = (id, on) =>
    setPendingIds((ids) => (on ? [...ids, id] : ids.filter((x) => x !== id)));

  /* ===== ADD / EDIT ===== */
  const handleAdd = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // Errors propagate to the modal so the user's input is preserved.
  const handleSave = async (task) => {
    setActionError("");
    if (editingTask) {
      const { data } = await updateTask({ ...task, taskId: editingTask.taskId });
      setTasks((prev) => prev.map((t) => (t.taskId === data.taskId ? data : t)));
    } else {
      const { data } = await createTask(task);
      setTasks((prev) => [...prev, data]);
    }
    setShowModal(false);
    setInsightsRevision((r) => r + 1);
  };

  /* ===== STATUS CHANGE ===== */
  const handleStatusChange = async (task, newStatus) => {
    if (pendingIds.includes(task.taskId) || task.status === newStatus) return;
    setActionError("");
    markPending(task.taskId, true);
    try {
      const { data } = await updateTask({ ...task, status: newStatus });
      setTasks((prev) => prev.map((t) => (t.taskId === data.taskId ? data : t)));
      setInsightsRevision((r) => r + 1);
    } catch (err) {
      setActionError(getApiError(err, "Failed to update the task status."));
    } finally {
      markPending(task.taskId, false);
    }
  };

  /* ===== DELETE ===== */
  const handleDelete = async (taskId) => {
    if (pendingIds.includes(taskId)) return;
    setActionError("");
    markPending(taskId, true);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      setInsightsRevision((r) => r + 1);
    } catch (err) {
      setActionError(getApiError(err, "Failed to delete the task."));
    } finally {
      markPending(taskId, false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      window.location.replace("/?loggedOut=1");
    }
  };

  const visibleTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

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
                  <button onClick={() => {
                      // Already on /dashboard, so navigating alone is a no-op: reset the view instead.
                      setView("tasks");
                      setStatusFilter("");
                      setShowProfileMenu(false);
                      setShowNavDropdown("");
                      navigate("/dashboard");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
                  <div className="px-4 py-2 text-gray-700 text-sm">Smart Productivity Tracker v1.0<br/>Created by Debaleena</div>
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
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Logged in as</p>
                    <p className="font-semibold text-indigo-700">{userName} ({userRole})</p>
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

          {/* Header (Dashboard/tasks view only) */}
          {view === "tasks" && (
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
          )}

          {/* View tabs */}
          <div className="flex gap-2 mb-6" role="tablist">
            {[["tasks", "Tasks"], ["insights", "Insights"]].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  view === key ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {view === "tasks" ? (
            <>
              {actionError && (
                <div role="alert" className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}
              {loadError ? (
                <div role="alert" className="rounded border border-red-300 bg-red-50 p-6 text-center text-red-700">
                  <p className="mb-3">{loadError}</p>
                  <button onClick={retryLoad} className="px-4 py-2 rounded bg-red-600 text-white">Retry</button>
                </div>
              ) : (
                <KanbanBoard
                  tasks={visibleTasks}
                  pendingIds={pendingIds}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              )}
            </>
          ) : (
            <Insights revision={insightsRevision} />
          )}

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
