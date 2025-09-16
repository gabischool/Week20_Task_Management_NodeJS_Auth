# Task Management System

A full-featured task management system built with Node.js, Express.js, and PostgreSQL. Features user authentication, CRUD operations for tasks and subtasks, and a robust API.

## Features

- 🔐 **User Authentication**: JWT-based authentication with secure password hashing
- 📝 **Task Management**: Create, read, update, and delete tasks
- ✅ **Subtask Support**: Organize tasks with subtasks
- 🎯 **Priority & Status**: Set task priorities and track status
- 📅 **Due Date Tracking**: Set and manage task deadlines
- 🔒 **Secure API**: Protected routes with middleware authentication
- 🗄️ **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, bcryptjs
- **Validation**: Built-in input validation

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Week20_Task_Management_NodeJS_Auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/task_management_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <jwt-token>
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <jwt-token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Complete Project",
  "description": "Finish the task management system",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-01-31T23:59:59.000Z",
  "assignedTo": "team-member"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "urgent"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <jwt-token>
```

### Subtasks

#### Get Subtasks for Task
```http
GET /api/tasks/:taskId/subtasks
Authorization: Bearer <jwt-token>
```

#### Create Subtask
```http
POST /api/tasks/:taskId/subtasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Research Phase",
  "description": "Gather requirements and research solutions"
}
```

#### Update Subtask
```http
PUT /api/subtasks/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "completed": true
}
```

#### Delete Subtask
```http
DELETE /api/subtasks/:id
Authorization: Bearer <jwt-token>
```

## Data Models

### Task Status
- `pending` - Task is waiting to be started
- `in_progress` - Task is currently being worked on
- `completed` - Task has been finished
- `cancelled` - Task has been cancelled

### Priority Levels
- `low` - Low priority task
- `medium` - Normal priority task
- `high` - High priority task
- `urgent` - Critical priority task

## Usage Examples

### Using cURL

1. **Register a new user**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
   ```

2. **Login and get token**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}'
   ```

3. **Create a task (use token from login)**
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Learn Node.js","description":"Study Express and middleware","status":"pending","priority":"high"}'
   ```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { data: { token } } = await loginResponse.json();

// Create task
const taskResponse = await fetch('http://localhost:3000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'New Task',
    description: 'Task description',
    status: 'pending',
    priority: 'medium'
  })
});
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
├── lib/
│   └── prisma.js          # Prisma client configuration
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── prisma/
│   └── schema.prisma      # Database schema
├── routes/
│   ├── auth.js            # Authentication routes
│   └── tasks.js           # Task management routes
├── services/
│   └── taskServices.js    # Business logic for tasks
├── server.js              # Main application file
└── package.json           # Dependencies and scripts
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **CORS Enabled**: Cross-origin requests are handled securely

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.
