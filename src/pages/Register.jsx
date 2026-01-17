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

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      await axios.post(
        "http://localhost:8080/auth/register",
        form
      )

      alert("Registration successful! Please login.")
      navigate("/")

    } catch (err) {
      alert("Registration failed")
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
