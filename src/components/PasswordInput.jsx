import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ disabled, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mb-3">
      <input
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className="input !mb-0 pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
