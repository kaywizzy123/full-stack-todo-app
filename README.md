# TodoApp — Full-Stack Todo Application

A full-stack todo list app. Users create an account, log in, and manage their own todo items. Each user sees only their own todos.

- **Frontend:** React 19 + Vite, styled with Tailwind CSS v4, routed with React Router
- **Backend:** Node.js + Express 5 REST API
- **Database:** SQLite (via `better-sqlite3`)
- **Auth:** Passwords hashed with `bcrypt`; sessions use JSON Web Tokens (JWT) stored in an httpOnly cookie

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up the backend](#2-set-up-the-backend)
  - [3. Set up the frontend](#3-set-up-the-frontend)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [How It Works](#how-it-works)
  - [Authentication flow](#authentication-flow)
  - [Frontend routing](#frontend-routing)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [Auth endpoints](#auth-endpoints)
  - [Todo endpoints](#todo-endpoints)
  - [Error format](#error-format)
- [Testing the API manually](#testing-the-api-manually)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)

---

## Features

- **Sign up and log in.** You are logged in straight after registering. Usernames and passwords are validated on the server.
- **Protected todo list.** Todos are only available with a valid JWT.
- **Add todos** from an input at the top of the list.
- **Edit todos.** Click **Edit** or double-click a title. Press Enter to save or Esc to cancel.
- **Mark todos done or not done** with a checkbox. Completed items are shown with a strikethrough.
- **Delete todos.**
- **Data is separated per user.** Every todo query is scoped to the logged-in user's ID.
- **Stays logged in across reloads and while active.** The JWT is kept in an httpOnly cookie that page scripts can't read. It is renewed automatically while you use the app.
- **Automatic logout** when the session expires or is rejected. Any `401` response from the API clears the session.
- **The avatar shows the logged-in user's initial.**
- **Responsive, dark-themed UI.** The auth pages have a split layout, and the background image is hidden on small screens.

## Tech Stack

| Layer    | Technology                                                             |
| -------- | ---------------------------------------------------------------------- |
| UI       | React 19, React Router 8                                               |
| Styling  | Tailwind CSS 4 (via `@tailwindcss/vite`)                               |
| Build    | Vite 8                                                                 |
| HTTP     | Axios (shared instance with a response interceptor)                    |
| Server   | Express 5 (ES modules)                                                 |
| Database | SQLite through `better-sqlite3`                                        |
| Security | `bcrypt` (password hashing), `jsonwebtoken` (JWT), `cookie-parser`, `cors` |
| Config   | `dotenv`                                                               |
| Testing  | `node:test` + Supertest (API), Vitest + React Testing Library (UI)     |
| Dev      | `nodemon` (backend auto-reload), ESLint (frontend)                     |

## Project Structure

```
full-stack-todo-app/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # verifyToken: checks the JWT cookie (or Bearer header), sets req.userId
│   ├── routes/
│   │   ├── auth.js          # register, login, logout, me
│   │   └── todos.js         # CRUD for todos (all routes protected)
│   ├── tests/
│   │   └── api.test.js      # API tests (node:test + Supertest, in-memory DB)
│   ├── utils/
│   │   └── authCookie.js    # Signs the JWT and sets/clears the httpOnly cookie
│   ├── app.js               # Express app: CORS, cookies, route mounting
│   ├── db.js                # Opens the SQLite DB, enables foreign keys, creates tables
│   ├── server.js            # Loads .env, checks config, starts listening
│   ├── .env.example         # Template for .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── bg.jpg           # Background image on the auth screens
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx     # Split layout for the auth screens; passes onLoginSuccess via Outlet context
    │   │   ├── Home.jsx     # Landing page with a "Get Started" button
    │   │   ├── Login.jsx    # Login form
    │   │   ├── Register.jsx # Sign-up form (registers, then logs in)
    │   │   ├── TodoList.jsx # Main app: list, add, edit, toggle, delete, logout
    │   │   └── TodoList.test.jsx
    │   ├── test/
    │   │   └── setup.js     # Vitest setup (jest-dom matchers)
    │   ├── api.js           # Axios instance (sends cookies) + 401 interceptor
    │   ├── App.jsx          # Session check, routing, auth gate
    │   ├── main.jsx         # React entry point
    │   └── index.css        # Tailwind import
    ├── .env.example         # Template for .env
    ├── index.html
    ├── vite.config.js       # Vite + Tailwind + Vitest config
    └── package.json
```

## Getting Started

### Prerequisites

- **Node.js 20.19+ or 22.12+.** Vite 8 needs one of these; Node 22 LTS is recommended.
- **npm** (comes with Node)
- A C/C++ build toolchain may be needed if `better-sqlite3` has no prebuilt binary for your platform (for example, Xcode Command Line Tools on macOS).

### 1. Clone the repository

```bash
git clone <your-repo-url> full-stack-todo-app
cd full-stack-todo-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file from the template:

```bash
cp .env.example .env
```

```env
PORT=3000
JWT_SECRET_KEY=replace-with-a-long-random-string
CLIENT_ORIGIN=http://localhost:5173
```

You can generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the API:

```bash
npm run dev     # with auto-reload (nodemon)
# or
npm start       # plain node
```

You should see:

```
Database connected
Server listening on port 3000
```

The SQLite database file `todos.db` is created in `backend/` the first time the server runs. The `users` and `todos` tables are created automatically.

If `JWT_SECRET_KEY` is missing, the server refuses to start and prints `JWT_SECRET_KEY is not set`.

### 3. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The frontend calls `http://localhost:3000/api` by default. To point it somewhere else, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

> **Note:** The backend only accepts requests from `CLIENT_ORIGIN` (default `http://localhost:5173`). If Vite starts on a different port because 5173 is taken, update `CLIENT_ORIGIN` in `backend/.env`.

## Environment Variables

**Backend** (`backend/.env`):

| Variable         | Required | Default                 | Description                                                   |
| ---------------- | -------- | ----------------------- | ------------------------------------------------------------- |
| `PORT`           | No       | `3000`                  | Port the Express server listens on.                           |
| `JWT_SECRET_KEY` | **Yes**  | —                       | Secret used to sign and verify JWTs. Keep it private.         |
| `CLIENT_ORIGIN`  | No       | `http://localhost:5173` | The frontend's URL, allowed through CORS.                     |
| `DB_PATH`        | No       | `todos.db`              | Path to the SQLite file (`:memory:` is used by the tests).    |
| `NODE_ENV`       | No       | —                       | Set to `production` so the auth cookie is only sent over HTTPS. |

**Frontend** (`frontend/.env`):

| Variable       | Required | Default                     | Description               |
| -------------- | -------- | --------------------------- | ------------------------- |
| `VITE_API_URL` | No       | `http://localhost:3000/api` | Base URL of the backend API. |

Both `.env` files are git-ignored and must never be committed.

## Available Scripts

### Backend (`backend/`)

| Command       | Description                                  |
| ------------- | -------------------------------------------- |
| `npm start`   | Starts the server with Node.                 |
| `npm run dev` | Starts the server with nodemon (auto-reload). |
| `npm test`    | Runs the API tests against an in-memory database. |

### Frontend (`frontend/`)

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Starts the Vite dev server with hot module reload.   |
| `npm run build`   | Builds a production bundle into `frontend/dist/`.    |
| `npm run preview` | Serves the production build locally.                 |
| `npm run lint`    | Runs ESLint over the frontend source.                |
| `npm test`        | Runs the component tests with Vitest.                |

## How It Works

### Authentication flow

1. **Register.** `Register.jsx` sends the username and password to `POST /api/auth/register`. The server trims and lowercases the username, validates both fields, hashes the password with bcrypt (10 salt rounds), and stores the user.
2. **Automatic login.** Right after registering, the frontend calls `POST /api/auth/login` with the same credentials.
3. **Cookie issued.** The server checks the password against the stored hash, signs a JWT with payload `{ userId }` that expires after **1 hour**, and sets it as a `token` cookie. The cookie is `httpOnly` (page scripts can't read it), `SameSite=Strict`, and `Secure` when `NODE_ENV=production`. The response body contains `{ id, username }`.
4. **Session restored on load.** `App.jsx` calls `GET /api/auth/me` on startup. If the cookie is valid, the user goes straight to their todos.
5. **Authenticated requests.** The Axios instance uses `withCredentials: true`, so the browser sends the cookie with every request automatically.
6. **Server check.** The `verifyToken` middleware verifies the JWT and puts `userId` on `req`. Every todo query filters by `user_id = req.userId`.
7. **Sliding renewal.** If a valid cookie is more than 15 minutes old, the middleware issues a fresh one. Active users stay logged in, and a session only expires after an hour without activity.
8. **Expiry or logout.** The Axios interceptor in `api.js` watches for `401` responses and clears the user. The **Logout** button calls `POST /api/auth/logout`, which deletes the cookie.

### Frontend routing

`App.jsx` decides what to show based on whether a token exists:

- **Logged in:** `TodoList` is rendered regardless of the URL.
- **Logged out:** these routes are available, all nested under the `Auth` layout:

| Path        | Component  | Purpose                        |
| ----------- | ---------- | ------------------------------ |
| `/`         | `Home`     | Landing page, "Get Started"    |
| `/login`    | `Login`    | Log in                         |
| `/register` | `Register` | Create an account              |

`Auth` passes `onLoginSuccess` to its child routes through React Router's `Outlet` context (`useOutletContext`).

## Database Schema

The SQLite file is `backend/todos.db`. Tables are created in [`backend/db.js`](backend/db.js).

**`users`**

| Column     | Type    | Constraints                  |
| ---------- | ------- | ---------------------------- |
| `id`       | INTEGER | PRIMARY KEY AUTOINCREMENT    |
| `username` | TEXT    | UNIQUE, NOT NULL             |
| `password` | TEXT    | NOT NULL (bcrypt hash)       |

**`todos`**

| Column    | Type    | Constraints                          |
| --------- | ------- | ------------------------------------ |
| `id`      | INTEGER | PRIMARY KEY AUTOINCREMENT            |
| `title`   | TEXT    | NOT NULL                             |
| `done`    | INTEGER | DEFAULT 0 (`0` = not done, `1` = done) |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → `users(id)`  |

Foreign keys are enforced: `db.js` runs `PRAGMA foreign_keys = ON` on every connection.

To reset all data, stop the server and delete `backend/todos.db`. It will be recreated empty on the next start.

## API Reference

Base URL: `http://localhost:3000/api`

All request and response bodies are JSON. Send `Content-Type: application/json` with every request that has a body.

Browsers are authenticated by the `token` cookie that login sets. Other clients, like curl, can send `Authorization: Bearer <token>` using the `token` field returned by login.

### Health check

#### `GET /`

(Mounted at the server root, not under `/api`.)

```json
200 OK
{ "message": "Server is running" }
```

### Auth endpoints

#### `POST /api/auth/register`

Creates a new user.

**Rules**

- `username`: trimmed and lowercased, then must be 3–30 characters of letters, numbers or `_`.
- `password`: 8–72 characters. bcrypt ignores anything past 72 bytes, hence the upper limit.

**Body**

```json
{ "username": "alice", "password": "secret123" }
```

**Responses**

| Status | Body                                           | When                         |
| ------ | ---------------------------------------------- | ---------------------------- |
| 201    | `{ "id": 1, "username": "alice" }`             | User created                 |
| 400    | `{ "error": "username and password required" }` | A field is missing          |
| 400    | `{ "error": "username must be 3-30 characters: ..." }` | Invalid username      |
| 400    | `{ "error": "password must be 8-72 characters" }` | Invalid password length   |
| 400    | `{ "error": "username already taken" }`        | Username already exists      |
| 500    | `{ "error": "Internal Server Error!" }`        | Unexpected error             |

#### `POST /api/auth/login`

Checks the credentials, sets the `token` cookie, and returns the user.

**Body**

```json
{ "username": "alice", "password": "secret123" }
```

**Responses**

| Status | Body                                            | When                     |
| ------ | ----------------------------------------------- | ------------------------ |
| 200    | `{ "id": 1, "username": "alice", "token": "<jwt>" }` + `Set-Cookie: token=...` | Login succeeded |
| 400    | `{ "error": "username and password required" }` | A field is missing       |
| 400    | `{ "error": "invalid username or password" }`   | Wrong username or password |
| 500    | `{ "error": "Internal Server Error!" }`          | Unexpected error         |

#### `POST /api/auth/logout`

Clears the `token` cookie.

```json
200 OK
{ "message": "Logged out" }
```

#### `GET /api/auth/me`

Returns the logged-in user. Requires authentication.

| Status | Body                                  | When                          |
| ------ | ------------------------------------- | ----------------------------- |
| 200    | `{ "id": 1, "username": "alice" }`    | Valid session                 |
| 401    | `{ "error": "..." }`                  | Not logged in, or user deleted |

### Todo endpoints

All todo endpoints **require authentication** (the cookie or a Bearer token).

Rules:

- `title` must be a non-empty string of at most 200 characters. Surrounding whitespace is trimmed.
- `:id` must be a positive integer. Anything else returns `400 { "error": "Invalid todo id" }`.

If the token is missing, malformed, invalid or expired, the response is `401`:

```json
{ "error": "No token provided" }
{ "error": "Malformed authorization header" }
{ "error": "Invalid or expired token" }
```

#### `GET /api/todos`

Returns every todo that belongs to the logged-in user.

```json
200 OK
[
  { "id": 1, "title": "Buy milk", "done": 0, "user_id": 1 },
  { "id": 2, "title": "Write README", "done": 1, "user_id": 1 }
]
```

> `done` is always `0` or `1` in every response.

#### `POST /api/todos`

Creates a todo.

**Body**

```json
{ "title": "Buy milk" }
```

| Status | Body                                                             |
| ------ | ---------------------------------------------------------------- |
| 201    | `{ "id": 3, "title": "Buy milk", "done": 0, "user_id": 1 }`      |
| 400    | `{ "error": "Title is required" }` or the length error          |

#### `PUT /api/todos/:id`

Replaces a todo. `title` is required. `done` is converted to `1` or `0`, and a missing `done` counts as not done.

**Body**

```json
{ "title": "Buy oat milk", "done": true }
```

| Status | Body                                                                |
| ------ | ------------------------------------------------------------------- |
| 200    | `{ "id": 3, "title": "Buy oat milk", "done": 1, "user_id": 1 }`     |
| 400    | `{ "error": "Title is required" }`                                  |
| 404    | `{ "error": "Todo not found" }` (missing, or owned by another user) |

#### `PATCH /api/todos/:id`

Partial update. Send `title`, `done`, or both. The frontend uses this endpoint for the done checkbox and for editing titles.

**Body**

```json
{ "done": true }
```

| Status | Body                                                          |
| ------ | ------------------------------------------------------------- |
| 200    | The updated row, e.g. `{ "id": 3, "title": "Buy milk", "done": 1, "user_id": 1 }` |
| 400    | `{ "error": "No fields provided to update" }` or a title error |
| 404    | `{ "error": "Todo not found" }`                               |

#### `DELETE /api/todos/:id`

Deletes a todo.

| Status | Body                              |
| ------ | --------------------------------- |
| 200    | `{ "message": "Deleted" }`        |
| 404    | `{ "error": "Todo not found" }`   |

### Error format

Every error response has an `error` string:

```json
{ "error": "Human-readable message" }
```

The frontend shows `error.response.data.error` on the login and register forms, and when adding or editing a todo fails. Server error responses never include stack traces or internal error objects.

## Testing the API manually

The automated tests cover the main flows (`npm test` in each folder). For manual testing, use `curl`, Postman, or the VS Code REST Client extension. `backend/test.rest` is ignored by git, so you can keep your own requests there.

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Log in and copy the "token" field from the response
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

TOKEN="paste-token-here"

# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Buy milk"}'

# List todos
curl http://localhost:3000/api/todos -H "Authorization: Bearer $TOKEN"

# Mark todo 1 as done
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"done":true}'

# Delete todo 1
curl -X DELETE http://localhost:3000/api/todos/1 -H "Authorization: Bearer $TOKEN"
```

## Security Notes

- Passwords are hashed with bcrypt and never returned by the API.
- The JWT lives in an `httpOnly`, `SameSite=Strict` cookie. Page scripts can't read it, and the browser won't send it on cross-site requests.
- Server logs and error responses never include secrets or raw error objects.
- The server refuses to start without `JWT_SECRET_KEY`.
- In production, set `NODE_ENV=production` and serve over HTTPS so the cookie gets the `Secure` flag.
- Serve the frontend and the API from the same site (for example `app.example.com` and `api.example.com`). A `SameSite=Strict` cookie is not sent across different sites.

## Roadmap

Possible next steps:

- [ ] Filter todos (all / active / completed) and a "clear completed" action
- [ ] Rate limiting on the auth endpoints
- [ ] Tests for the Login and Register components
- [ ] Deployment guide (e.g. Render/Railway for the API, Vercel/Netlify for the frontend)

---

Built by **Oluwakayode Ogunremi**.
