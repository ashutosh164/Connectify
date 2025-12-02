import { useState } from "react";
import api from "../api"; // import the api function
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- use context


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post("/api/login/", {
        username,
        password,
      });

      // Example response:
      // { token, user_id, username, email }

      // Save globally + persist in localStorage
      login(response.data.data);

      // Redirect after login
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Right Section - Login Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-center text-2xl font-semibold text-green-500">
            Login
          </h2>
          <p className="text-center text-gray-500 text-sm mt-1">
            Start getting your questions answered
          </p>

          {/* Login Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                placeholder="Email or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full mt-4 rounded-md bg-green-400 text-white font-semibold py-2 hover:bg-green-500"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
          <Link to="/register" className="text-green-500 hover:underline">
          Sign up now
        </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
