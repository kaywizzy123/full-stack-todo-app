import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./components/Auth";
import Login from "./components/Login";
import Register from "./components/Register";
import TodoList from "./components/TodoList";
import Home from "./components/Home";
import api, { setOnUnauthorized } from "./api";

function App() {
  // The auth token lives in an httpOnly cookie that JavaScript can't read,
  // so we ask the server who is logged in instead.
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => setUser(null));

    // Clean up the token left over from the old localStorage-based login
    localStorage.removeItem("token");

    const checkSession = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    }
    setUser(null);
  };

  if (checkingSession) {
    return <div className="min-h-screen w-screen bg-neutral-950" />;
  }

  return (
    <BrowserRouter>
      {user ? (
        <TodoList user={user} onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route path="/" element={<Auth onLoginSuccess={setUser} />}>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}
export default App;
