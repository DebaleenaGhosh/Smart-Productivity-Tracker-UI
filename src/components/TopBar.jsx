import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function TopBar({ onAdd }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
            onClick={() => onAdd?.()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
            + Add Task
        </button>
        <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
            Logout
        </button>
      </div>
    </div>
  );
}
