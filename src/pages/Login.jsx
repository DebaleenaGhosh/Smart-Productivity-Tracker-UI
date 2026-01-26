import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import axios from "axios"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    userName: "",
    password: "",
    email: ""
  })
  const [message, setMessage] = useState("")

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
      if (err.response && err.response.status === 401) {
        setMessage("Wrong username or password");
      } else {
        setMessage("Login failed. Please try again.");
      }
    }
  }



  useEffect(() => {
    // Show logout message if redirected from logout
    if (location.search.includes("loggedOut=1")) {
      setMessage("Logged out successfully")
      // Remove query param from URL after showing message
      window.history.replaceState({}, document.title, "/")
    }
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [message, location])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        {message && <div className="alert alert-success mb-4 text-green-700 bg-green-100 border border-green-300 rounded p-2 text-center">{message}</div>}
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
