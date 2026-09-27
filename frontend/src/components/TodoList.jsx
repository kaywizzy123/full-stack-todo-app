import { useState, useEffect } from "react";
import api from "../api";

const MAX_TITLE_LENGTH = 200;

const TodoList = ({ user, onLogout }) => {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get("/todos");
        setTodos(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load todos");
      }
    };
    fetchTodos();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!newTodoTitle.trim()) return;

    try {
      const response = await api.post("/todos", {
        title: newTodoTitle.trim(),
      });

      setTodos([...todos, response.data]);
      setNewTodoTitle("");
      setError("");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to add todo");
    }
  };

  const handleToggleDone = async (id, currentDone) => {
    try {
      const response = await api.patch(`/todos/${id}`, { done: !currentDone });

      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error(error);
      setError("Failed to update todo");
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const title = editTitle.trim();
    const original = todos.find((todo) => todo.id === editingId);
    if (!title || title === original?.title) {
      cancelEditing();
      return;
    }

    try {
      const response = await api.patch(`/todos/${editingId}`, { title });

      setTodos(
        todos.map((todo) => (todo.id === editingId ? response.data : todo)),
      );
      setError("");
      cancelEditing();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to update todo");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/todos/${id}`);

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error(error);
      setError("Failed to delete todo");
    }
  };

  return (
    <div className="flex flex-col bg-neutral-950 min-h-screen text-neutral-100 w-screen items-center">
      <div className="flex flex-col mt-4 w-screen sm:w-3xl lg:w-5xl px-2 gap-3">
        <nav className="flex justify-between items-center">
          <div className="text-3xl sm:text-4xl font-bold">
            <h1>
              Todo<span className="text-blue-700">APP</span>
            </h1>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <div
              title={user.username}
              className="w-10 h-10 bg-neutral-500 rounded-full flex items-center justify-center border border-neutral-300/80"
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="bg-blue-700 px-2.5 py-1.5 rounded"
            >
              Logout
            </button>
          </div>
        </nav>

        <form onSubmit={handleAddTodo} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new todo..."
            value={newTodoTitle}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="flex-1 border border-neutral-700/60 bg-neutral-800/60 px-3 py-1.5 rounded-2xl focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            className="bg-blue-700 px-4 py-1.5 rounded-2xl hover:bg-blue-800"
          >
            Add
          </button>
        </form>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {todos.length === 0 ? (
          <div>No todos entered</div>
        ) : (
          <div className="flex flex-col gap-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between gap-3 border border-neutral-700/60 bg-neutral-900/40 px-3 py-2 rounded-2xl"
              >
                {editingId === todo.id ? (
                  <form
                    onSubmit={handleSaveEdit}
                    className="flex flex-1 items-center gap-2"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      maxLength={MAX_TITLE_LENGTH}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                      autoFocus
                      className="flex-1 border border-neutral-700/60 bg-neutral-800/60 px-3 py-1 rounded-2xl focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      className="text-blue-500 hover:text-blue-400 text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="text-neutral-400 hover:text-neutral-300 text-sm"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={!!todo.done}
                        onChange={() => handleToggleDone(todo.id, todo.done)}
                        className="w-4 h-4 shrink-0"
                      />
                      <span
                        onDoubleClick={() => startEditing(todo)}
                        className={`break-words ${todo.done ? "line-through text-neutral-500" : ""}`}
                      >
                        {todo.title}
                      </span>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-blue-500 hover:text-blue-400 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
