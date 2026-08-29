import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./components/Auth";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [token, setToken] = useState(null);
  console.log("Current token:", token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth onLoginSuccess={setToken} />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
