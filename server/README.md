# Campus Management System - Backend API

Complete MERN stack backend for Campus Reservation and Project Evaluation System.

## 🚀 Features

- ✅ **User Authentication** (JWT with bcrypt password hashing)
- ✅ **Role-based Access Control** (Admin, Faculty, Student)
- ✅ **Project Management** (CRUD operations)
- ✅ **Evaluation System** (Faculty can evaluate student projects)
- ✅ **Reservation System** (Desks, Labs, Meeting Rooms)
- ✅ **MongoDB Database** (Persistent data storage)
- ✅ **RESTful API** (Clean, documented endpoints)

---

## 📁 Project Structure

```
backend/
├── server.js              # Express server entry point
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── models/                # MongoDB schemas
│   ├── User.js           # User model (authentication)
│   ├── Project.js        # Project model
│   ├── Evaluation.js     # Evaluation model
│   └── Reservation.js    # Reservation model
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── projects.js       # Project CRUD routes
│   ├── evaluations.js    # Evaluation routes
│   ├── users.js          # User management
│   └── reservations.js   # Reservation routes
├── middleware/            # Custom middleware
│   └── auth.js           # JWT authentication & authorization
├── scripts/               # Utility scripts
│   └── seedData.js       # Database seeding script
└── README.md             # This file
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/campus-management
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### 3. Install MongoDB

**Option A: Local MongoDB**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and run: `mongod`

**Option B: MongoDB Atlas (Cloud - FREE)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Replace `MONGODB_URI` in `.env`

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates sample users, projects, and evaluations.

**Login Credentials:**
- Admin: `admin@campus.edu` / `admin123`
- Faculty: `sarah.johnson@campus.edu` / `faculty123`
- Student: `kingkor@student.campus.edu` / `student123`

### 5. Start Server

**Development mode (auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Projects

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get all projects | Private |
| GET | `/api/projects/:id` | Get single project | Private |
| POST | `/api/projects` | Create project | Student |
| PUT | `/api/projects/:id` | Update project | Owner/Admin |
| DELETE | `/api/projects/:id` | Delete project | Owner/Admin |

### Evaluations

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/evaluations` | Get all evaluations | Private |
| GET | `/api/evaluations/:id` | Get single evaluation | Private |
| POST | `/api/evaluations` | Assign evaluation | Faculty/Admin |
| PUT | `/api/evaluations/:id` | Submit evaluation | Faculty/Admin |
| DELETE | `/api/evaluations/:id` | Delete evaluation | Admin/Owner |
| GET | `/api/evaluations/project/:id/summary` | Get project summary | Private |

### Reservations

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reservations` | Get all reservations | Private |
| GET | `/api/reservations/:id` | Get single reservation | Private |
| POST | `/api/reservations` | Create reservation | Private |
| PUT | `/api/reservations/:id` | Update reservation | Owner/Admin |
| DELETE | `/api/reservations/:id` | Cancel reservation | Owner/Admin |
| GET | `/api/reservations/check-availability` | Check availability | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin/Self |
| PUT | `/api/users/:id` | Update user | Admin/Self |
| DELETE | `/api/users/:id` | Delete user | Admin |

---

## 🔐 Authentication

All protected routes require JWT token in header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Example Login Request

```javascript
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@campus.edu",
  "password": "student123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6576abc123...",
    "name": "Kingkor",
    "email": "kingkor@student.campus.edu",
    "role": "student",
    "studentId": "CS2021-1234"
  }
}
```

---

## 📝 Example API Usage

### 1. Register New Student

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@student.campus.edu",
    "password": "password123",
    "role": "student",
    "studentId": "CS2024-1111",
    "department": "Computer Science"
  }'
```

### 2. Create Project (Student)

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Smart Campus App",
    "description": "Mobile app for campus services",
    "department": "Computer Science",
    "startDate": "2024-09-01",
    "endDate": "2025-05-15",
    "supervisor": "Dr. Sarah Johnson"
  }'
```

### 3. Assign Evaluation (Faculty)

```bash
curl -X POST http://localhost:5000/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FACULTY_TOKEN" \
  -d '{
    "projectId": "PROJECT_ID_HERE",
    "assessorRole": "Supervisor"
  }'
```

### 4. Submit Evaluation Scores (Faculty)

```bash
curl -X PUT http://localhost:5000/api/evaluations/EVALUATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FACULTY_TOKEN" \
  -d '{
    "criteria": [
      { "name": "Research & Analysis", "maxScore": 20, "score": 18, "comment": "Excellent work" },
      { "name": "Methodology & Approach", "maxScore": 20, "score": 17, "comment": "Good approach" },
      { "name": "Implementation & Execution", "maxScore": 20, "score": 19, "comment": "Very well done" },
      { "name": "Results & Discussion", "maxScore": 20, "score": 16, "comment": "Good results" },
      { "name": "Presentation & Documentation", "maxScore": 20, "score": 18, "comment": "Clear presentation" }
    ],
    "finalComment": "Outstanding project!",
    "status": "Submitted"
  }'
```

---

## 🧪 Testing the API

### Using Postman

1. Import collection: Create requests for each endpoint
2. Set environment variable: `token` = your JWT token
3. Use `{{token}}` in Authorization header

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests
3. Save responses

### Using cURL (Command Line)

See examples above

---

## 🔧 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### JWT Secret Error

```
Error: secretOrPrivateKey must have a value
```

**Solution:** Make sure `.env` file exists and has `JWT_SECRET`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Change port in `.env` or kill process using port 5000

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemon** - Auto-restart server (dev)

---

## 🚀 Deployment

### Deploy to Render.com (FREE)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Add environment variables
6. Deploy!

### Deploy to Railway.app (FREE)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add MongoDB plugin
5. Add environment variables
6. Deploy!

---

## 🎓 Next Steps

After backend is running:

1. ✅ Test all endpoints with Postman
2. ✅ Connect frontend to backend (update API calls)
3. ✅ Deploy backend to cloud (Render/Railway)
4. ✅ Deploy frontend (Vercel/Netlify)
5. ✅ Update frontend API URL to production backend

---

## 📧 Support

For issues or questions, contact the development team.

**Happy Coding! 🎉**
