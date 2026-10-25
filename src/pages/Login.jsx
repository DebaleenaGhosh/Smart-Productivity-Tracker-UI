import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { login } from "../services/authService"
import { getApiError } from "../utils/apiError"
import PasswordInput from "../components/PasswordInput"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const message = location.state?.message ||
    (new URLSearchParams(location.search).get("loggedOut") === "1" ? "Logged out successfully" : "")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (pending || !e.currentTarget.reportValidity()) return
    setPending(true)
    setError("")
    try {
      await login(form)
      const from = location.state?.from
      const destination = typeof from === "string" && from.startsWith("/") &&
        !from.startsWith("//") && from !== "/" && from !== "/register" ? from : "/dashboard"
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getApiError(err, err.response?.status === 401
        ? "Wrong username or password."
        : "Login failed. Please try again."))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        aria-busy={pending}
        aria-describedby={error ? "login-error" : undefined}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        {message && <div role="status" className="alert alert-success mb-4 text-green-700 bg-green-100 border border-green-300 rounded p-2 text-center">{message}</div>}
        {error && <div id="login-error" role="alert" className="mb-4 text-red-700 bg-red-100 border border-red-300 rounded p-2 text-center">{error}</div>}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Login
        </h2>

        <input
          name="username"
          placeholder="Username"
          aria-label="Username"
          autoComplete="username"
          value={form.username}
          disabled={pending}
          className="input"
          onChange={handleChange}
          required
        />

        <PasswordInput
          name="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          value={form.password}
          disabled={pending}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={pending} className="btn-primary w-full mt-4 disabled:opacity-50">
          {pending ? "Logging in…" : "Login"}
        </button>

        {/* 👇 SMALL REGISTER LINK */}
        <p className="text-sm text-center mt-4 text-gray-600">
          New user?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  )
}
