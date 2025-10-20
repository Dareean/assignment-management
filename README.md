# 📚 Assignment Management API

A robust and scalable RESTful API for managing assignments, built with AdonisJS and MongoDB. This application provides full CRUD operations with secure token-based authentication.

## 🚀 Features

- **🔐 Authentication System** - User registration and login with token-based auth
- **📝 CRUD Operations** - Full Create, Read, Update, Delete for assignments
- **🛡️ Security** - Password hashing and token-based authorization
- **📊 MongoDB Integration** - Cloud database with MongoDB Atlas
- **🎯 RESTful Design** - Clean and predictable API endpoints

## 🛠️ Tech Stack

- **Framework**: AdonisJS 5 (Node.js TypeScript Framework)
- **Database**: MongoDB Atlas
- **Authentication**: Custom Token-based
- **Language**: TypeScript
- **Environment Variables**: Env configuration

## 📁 Project Structure
assignment-management/
├── app/
│ ├── Controllers/Http/
│ │ ├── AuthController.ts
│ │ └── AssignmentsController.ts
│ ├── Models/
│ │ ├── User.ts
│ │ └── Assignment.ts
│ └── Services/
│ └── MongoDBService.ts
├── start/
│ └── routes.ts
├── .env
└── README.md

text

## ⚡ Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/assignment-management.git
   cd assignment-management
Install dependencies

bash
npm install
Environment Configuration
Create .env file:

env
NODE_ENV=development
PORT=3333
APP_KEY=your-app-key-here
HOST=localhost
LOG_LEVEL=info
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
Generate App Key

bash
node ace generate:key
Start the development server

bash
node ace serve --watch
Server will run at: http://localhost:3333

📚 API Documentation
Authentication Endpoints
Register User
http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
Login User
http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
Response includes authentication token for subsequent requests.

Assignment Endpoints
All assignment endpoints require Bearer Token authentication.

Get All Assignments
http
GET /assignments
Authorization: Bearer your_token_here
Get Assignment by ID
http
GET /assignments/:id
Authorization: Bearer your_token_here
Create Assignment
http
POST /assignments
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "title": "Assignment Title",
  "description": "Assignment description",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
Update Assignment
http
PUT /assignments/:id
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "title": "Updated Title",
  "isCompleted": true
}
Delete Assignment
http
DELETE /assignments/:id
Authorization: Bearer your_token_here
🔐 Authentication Flow
Register a new user at /register

Login with credentials at /login to receive token

Use the token in Authorization header for all assignment requests

Token format: Bearer token_randomstring_userid

🗃️ Database Models
User Model
typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
Assignment Model
typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  dueDate: Date,
  isCompleted: boolean,
  userId: string,
  createdAt: Date,
  updatedAt: Date
}
🧪 Testing the API
Use tools like:

Thunder Client (VS Code extension)

Postman

cURL

Example testing flow:

bash
# 1. Register user
curl -X POST http://localhost:3333/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Login and get token
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Use token for assignments
curl -X GET http://localhost:3333/assignments \
  -H "Authorization: Bearer your_token_here"
🚀 Deployment
Build for Production
bash
node ace build
Start Production Server
bash
node build/bin/server.js
🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License.

👨‍💻 Author
Your Name

GitHub: @dareean

🙏 Acknowledgments
AdonisJS team for the excellent framework

MongoDB for the cloud database service
