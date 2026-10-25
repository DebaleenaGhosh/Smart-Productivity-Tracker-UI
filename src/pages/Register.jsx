import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../services/authService"
import { getApiError } from "../utils/apiError"
import PasswordInput from "../components/PasswordInput"

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (pending || !e.currentTarget.reportValidity()) return
    setPending(true)
    setError("")
    try {
      await register(form)
      navigate("/", { replace: true, state: { message: "Registration successful! Please login." } })
    } catch (err) {
      setError(getApiError(err, err.response?.status === 400
        ? "Check your details; the username or email may already be in use."
        : "Registration failed. Please try again."))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        aria-busy={pending}
        aria-describedby={error ? "register-error" : undefined}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Register
        </h2>

        {error && <div id="register-error" role="alert" className="mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded p-2">{error}</div>}

        <input
          name="userName"
          placeholder="Username"
          aria-label="Username"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          value={form.userName}
          disabled={pending}
          className="input"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={form.email}
          disabled={pending}
          className="input"
          onChange={handleChange}
          required
        />

        <PasswordInput
          name="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="new-password"
          minLength={8}
          maxLength={100}
          value={form.password}
          disabled={pending}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={pending} className="btn-primary w-full mt-4 disabled:opacity-50">
          {pending ? "Registering…" : "Register"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already registered?{" "}
          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
