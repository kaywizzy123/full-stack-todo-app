import { test, before } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

// Use a throwaway in-memory database and a test secret.
// These must be set before app.js (and db.js) are imported.
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET_KEY = "test-secret";

const { default: app } = await import("../app.js");

const credentials = { username: "alice", password: "password123" };
let agent; // keeps cookies between requests, like a browser

before(async () => {
  agent = request.agent(app);
  await agent.post("/api/auth/register").send(credentials).expect(201);
  await agent.post("/api/auth/login").send(credentials).expect(200);
});

test("register rejects short passwords", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: "bob", password: "short" });
  assert.equal(res.status, 400);
});

test("register rejects invalid usernames", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: "a b!", password: "password123" });
  assert.equal(res.status, 400);
});

test("register rejects duplicate usernames (case-insensitive)", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: "ALICE", password: "password123" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, "username already taken");
});

test("login sets an httpOnly cookie and never leaks error details", async () => {
  const res = await request(app).post("/api/auth/login").send(credentials);
  assert.equal(res.status, 200);
  assert.equal(res.body.username, "alice");
  const cookie = res.headers["set-cookie"].join(";");
  assert.match(cookie, /token=/);
  assert.match(cookie, /HttpOnly/);

  const bad = await request(app)
    .post("/api/auth/login")
    .send({ username: "alice", password: "wrong-password" });
  assert.equal(bad.status, 400);
  assert.deepEqual(Object.keys(bad.body), ["error"]);
});

test("GET /me returns the logged-in user", async () => {
  const res = await agent.get("/api/auth/me").expect(200);
  assert.equal(res.body.username, "alice");
});

test("todos require authentication", async () => {
  await request(app).get("/api/todos").expect(401);
});

test("todo create, edit, toggle and delete", async () => {
  const created = await agent
    .post("/api/todos")
    .send({ title: "  Buy milk  " })
    .expect(201);
  assert.equal(created.body.title, "Buy milk");
  const id = created.body.id;

  const edited = await agent
    .patch(`/api/todos/${id}`)
    .send({ title: "Buy oat milk" })
    .expect(200);
  assert.equal(edited.body.title, "Buy oat milk");

  const toggled = await agent
    .patch(`/api/todos/${id}`)
    .send({ done: true })
    .expect(200);
  assert.equal(toggled.body.done, 1);

  await agent.delete(`/api/todos/${id}`).expect(200);
  const list = await agent.get("/api/todos").expect(200);
  assert.equal(list.body.length, 0);
});

test("todo validation", async () => {
  await agent.post("/api/todos").send({ title: "   " }).expect(400);
  await agent.post("/api/todos").send({ title: 123 }).expect(400);
  await agent
    .post("/api/todos")
    .send({ title: "x".repeat(201) })
    .expect(400);
  await agent.patch("/api/todos/abc").send({ done: true }).expect(400);
});

test("users cannot touch each other's todos", async () => {
  const other = request.agent(app);
  const bob = { username: "bob", password: "password123" };
  await other.post("/api/auth/register").send(bob).expect(201);
  await other.post("/api/auth/login").send(bob).expect(200);

  const todo = await agent.post("/api/todos").send({ title: "private" });
  await other.delete(`/api/todos/${todo.body.id}`).expect(404);
  const bobsList = await other.get("/api/todos").expect(200);
  assert.equal(bobsList.body.length, 0);
});

test("logout clears the cookie", async () => {
  const session = request.agent(app);
  await session.post("/api/auth/login").send(credentials).expect(200);
  await session.post("/api/auth/logout").expect(200);
  await session.get("/api/auth/me").expect(401);
});
