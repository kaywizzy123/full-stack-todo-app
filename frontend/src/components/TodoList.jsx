import { useState, useEffect } from "react";
import api from "../api";

const TodoList = ({ token, onLogout }) => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await api.get("/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data);
    };
    fetchTodos();
  }, [token]);
  return (
    <div className="flex flex-col bg-neutral-950 min-h-screen text-neutral-100 w-screen items-center">
      <div className="flex flex-col mt-4 w-screen sm:w-3xl lg:w-5xl px-2 gap-3">
        <div className="flex justify-between items-center">
          <div className="text-4xl font-bold">
            Todo<span className="text-blue-700">APP</span>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-neutral-500 rounded-full flex items-center justify-center">
              K
            </div>
            <button
              onClick={onLogout}
              className="bg-blue-700 px-2 py-1.5 rounded"
            >
              Logout
            </button>
          </div>
        </div>
        {todos.length <= 0 ? (
          <div>No todos entered</div>
        ) : (
          <div>
            {todos.map((todo) => (
              <p key={todo.id}>{todo.title}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
