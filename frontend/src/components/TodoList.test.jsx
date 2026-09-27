import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoList from "./TodoList";
import api from "../api";

vi.mock("../api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const user = { id: 1, username: "kayode" };

describe("TodoList", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.get.mockResolvedValue({
      data: [{ id: 1, title: "Buy milk", done: 0, user_id: 1 }],
    });
  });

  it("shows the user's initial and their todos", async () => {
    render(<TodoList user={user} onLogout={() => {}} />);
    expect(await screen.findByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByTitle("kayode")).toHaveTextContent("K");
  });

  it("adds a todo", async () => {
    api.post.mockResolvedValue({
      data: { id: 2, title: "Walk dog", done: 0, user_id: 1 },
    });
    render(<TodoList user={user} onLogout={() => {}} />);
    await screen.findByText("Buy milk");

    await userEvent.type(
      screen.getByPlaceholderText("Add a new todo..."),
      "  Walk dog  {enter}",
    );

    expect(api.post).toHaveBeenCalledWith("/todos", { title: "Walk dog" });
    expect(await screen.findByText("Walk dog")).toBeInTheDocument();
  });

  it("edits a todo title", async () => {
    api.patch.mockResolvedValue({
      data: { id: 1, title: "Buy oat milk", done: 0, user_id: 1 },
    });
    render(<TodoList user={user} onLogout={() => {}} />);
    await screen.findByText("Buy milk");

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.getByDisplayValue("Buy milk");
    await userEvent.clear(input);
    await userEvent.type(input, "Buy oat milk{enter}");

    expect(api.patch).toHaveBeenCalledWith("/todos/1", {
      title: "Buy oat milk",
    });
    expect(await screen.findByText("Buy oat milk")).toBeInTheDocument();
  });

  it("cancels editing with Escape", async () => {
    render(<TodoList user={user} onLogout={() => {}} />);
    await screen.findByText("Buy milk");

    await userEvent.dblClick(screen.getByText("Buy milk"));
    await userEvent.type(screen.getByDisplayValue("Buy milk"), " extra{Escape}");

    expect(api.patch).not.toHaveBeenCalled();
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("toggles and deletes a todo", async () => {
    api.patch.mockResolvedValue({
      data: { id: 1, title: "Buy milk", done: 1, user_id: 1 },
    });
    api.delete.mockResolvedValue({ data: { message: "Deleted" } });
    render(<TodoList user={user} onLogout={() => {}} />);
    await screen.findByText("Buy milk");

    await userEvent.click(screen.getByRole("checkbox"));
    expect(api.patch).toHaveBeenCalledWith("/todos/1", { done: true });

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(api.delete).toHaveBeenCalledWith("/todos/1");
    expect(screen.getByText("No todos entered")).toBeInTheDocument();
  });

  it("calls onLogout", async () => {
    const onLogout = vi.fn();
    render(<TodoList user={user} onLogout={onLogout} />);
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(onLogout).toHaveBeenCalled();
  });
});
