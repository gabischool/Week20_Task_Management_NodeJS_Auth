# Week 20: Task Management API with Authentication

Build authentication with **JWT** and **bcrypt**.

The server and database models are already set up. You fill in the TODOs.

> **Do these 5 things.**
>
> 1. Create `.env`
> 2. Finish `middleware/auth.js`
> 3. Finish `POST /api/auth/register`
> 4. Finish `POST /api/auth/login`
> 5. Protect `GET /api/my-tasks`

---

## Setup

1. Fork and clone this repo.
2. `cd Week20_Task_Management_NodeJS_Auth`
3. Install dependencies:

```bash
npm install
```

4. Create `.env` (next section).
5. Set up the database:

```bash
npm run db:generate
npm run db:push
```

6. Start the server:

```bash
npm run dev
```

The API runs at **`http://localhost:3000`**.

---

## What you need to build

### 1. `.env`

> **Do this first.** The app needs this file. Do not commit it.

Create `.env` in the project root:

```env
DATABASE_URL="your-supabase-database-connection-url"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

---

### 2. `middleware/auth.js`

Finish `authenticateToken`:

1. Get the token from the `Authorization: Bearer <token>` header
2. Verify the token
3. Get the user from the database
4. If the user doesn't exist, throw an error
5. Attach the user to `req.user` (no password)
6. Call `next()`

A bad or expired token should return **401**. That part is already in the `catch` block.

---

### 3. `POST /api/auth/register`

**File:** `routes/auth.js`

1. Validate the input (`email`, `password`, `name`)
2. Check if the user already exists
3. Hash the password with bcrypt (**12** salt rounds)
4. Create the user
5. Generate a JWT with `userId` and `email`
6. Return the user (no password) and the token

---

### 4. `POST /api/auth/login`

**File:** `routes/auth.js`

1. Validate the input (`email`, `password`)
2. Check if the user exists
3. Compare the password with bcrypt
4. Generate a JWT with `userId` and `email`
5. Return the user (no password) and the token

Wrong email or password should return **401**.

`GET /api/auth/me` is already written. It works after your middleware sets `req.user`.

---

### 5. `GET /api/my-tasks`

**File:** `routes/tasks.js`

> **This route is public until you protect it.**

1. Import `authenticateToken` from `middleware/auth.js`
2. Add it to this route
3. Use `prisma` to get tasks where `userId` is `req.user.id`
4. Send those tasks back

No token should return **401**.

---

## Test it

Send this header on every protected request:

```
Authorization: Bearer <token>
```

| Step | Request | Pass when |
| --- | --- | --- |
| 1 | `POST /api/auth/register` | You get a user (no password) and a token |
| 2 | Register the same email again | The request is rejected |
| 3 | `POST /api/auth/login` | Right password returns a token. Wrong password returns **401** |
| 4 | `GET /api/auth/me` with your token | You get the logged-in user |
| 5 | `GET /api/auth/me` with no token | **401** |
| 6 | Add a task in Prisma Studio (`npm run db:studio`) with your user id, then `GET /api/my-tasks` | You only see **your** tasks |
| 7 | `GET /api/my-tasks` with no token | **401** |

---

## Stretch goals

Optional. Finish the 5 required tasks first.

### Password reset

1. Create an endpoint that makes a reset token
2. Log the reset link with `console.log` (no real email)
3. Create an endpoint that checks the token
4. Update the user's password

### Email verification

1. Add a verification field on the User model
2. Make a verification token when someone registers
3. Log the verification link with `console.log`
4. Create an endpoint that checks the token
5. Mark the user as verified

---

Start with `.env` and the middleware. The other routes need `req.user`.
