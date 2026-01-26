import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    role: "USER"
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      await axios.post(
        "http://localhost:8080/auth/register",
        form
      )

      setMessage("Registration successful! Please login.");
      setTimeout(() => navigate("/"), 1500);

    } catch (err) {
      if (err.response && err.response.status === 400) {
        setMessage("Username or email already in use.");
      } else {
        setMessage("Registration failed. Please try again.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Register
        </h2>

        {message && <div className="alert alert-info mb-4 text-center text-blue-700 bg-blue-100 border border-blue-300 rounded p-2">{message}</div>}

        <input
          name="userName"
          placeholder="Username"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          className="input"
          onChange={handleChange}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="PREMIUM_USER">PREMIUM USER</option>
          <option value="MODERATOR">MODERATOR</option>
        </select>

        <button className="btn-primary w-full mt-4">
          Register
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
