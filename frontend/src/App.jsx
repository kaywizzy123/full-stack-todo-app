import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./components/Auth";
import Login from "./components/Login";
import Register from "./components/Register";
import TodoList from "./components/TodoList";

function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <BrowserRouter>
      {token ? (
        <TodoList token={token} onLogout={() => setToken(null)} />
      ) : (
        <Routes>
          <Route path="/" element={<Auth onLoginSuccess={setToken} />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}
export default App;
