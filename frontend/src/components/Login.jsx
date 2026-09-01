import { useState } from "react";
import { Link } from "react-router";
import api from "../api";
import { useOutletContext } from "react-router";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { onLoginSuccess } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const response = await api.post("/auth/login", {
        username: cleanUsername,
        password: cleanPassword,
      });
      const token = response.data.token;
      setPassword("");
      setUsername("");
      setError("");
      onLoginSuccess(token);
    } catch (error) {
      setError(error.response?.data?.error || "Login failed. Please try again");
    }
  };

  return (
    <div className="w-full flex flex-col text-center max-w-sm gap-4 border border-neutral-500/10 backdrop-blur-xl bg-neutral-900/40 p-10 rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-neutral-700/60 bg-neutral-600/40 px-3 py-1.5 rounded-2xl focus:outline-none focus:border-blue-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-neutral-700/60 bg-neutral-600/40 px-3 py-1.5 rounded-2xl focus:outline-none focus:border-blue-600"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-2xl transition-all hover:bg-blue-700 font-bold hover:-translate-y-1 "
        >
          Log In
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-700 hover:text-blue-900">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
