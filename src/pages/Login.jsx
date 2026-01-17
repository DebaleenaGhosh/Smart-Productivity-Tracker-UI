import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    userName: "",
    password: "",
    email: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(
        "http://localhost:8080/auth/login",
        form
      )

      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")

    } catch (err) {
      alert("Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Login
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

        <button className="btn-primary w-full mt-4">
          Login
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
