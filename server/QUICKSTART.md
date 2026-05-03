# ⚡ Quick Start - 5 Minutes to Running Backend

Follow these steps to get your backend running in 5 minutes:

---

## 🚀 Step 1: Install MongoDB (Choose One)

### Option A: Local MongoDB
```bash
# Mac
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Linux
sudo apt-get install mongodb
sudo systemctl start mongod

# Windows
# Download installer from: https://www.mongodb.com/try/download/community
# Run installer → Start MongoDB service
```

### Option B: MongoDB Atlas (Cloud - No Installation)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create FREE account
3. Create FREE cluster (M0)
4. Get connection string

---

## 📦 Step 2: Install Dependencies

```bash
cd backend
npm install
```

---

## ⚙️ Step 3: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env file
# For local MongoDB, it's already configured
# For MongoDB Atlas, replace MONGODB_URI with your connection string
```

**Minimum `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/campus-management
JWT_SECRET=my_super_secret_key_123
PORT=5000
```

---

## 🌱 Step 4: Seed Database

```bash
npm run seed
```

**Output:**
```
✅ Created users
✅ Created projects
✅ Created evaluations

Login credentials:
- Admin: admin@campus.edu / admin123
- Faculty: sarah.johnson@campus.edu / faculty123
- Student: kingkor@student.campus.edu / student123
```

---

## 🎯 Step 5: Start Server

```bash
npm run dev
```

**You should see:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

---

## ✅ Step 6: Test

Open browser:
```
http://localhost:5000/api/health
```

**You should see:**
```json
{
  "status": "OK",
  "message": "Campus Management System Backend is running"
}
```

---

## 🎉 Done!

Your backend is now running at: **http://localhost:5000**

### Test Login with cURL:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@campus.edu","password":"student123"}'
```

---

## 🔗 Next: Connect Frontend

1. Create frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

2. Use the API service at `/services/api.ts`

3. Example:
```typescript
import { authAPI } from './services/api';

const response = await authAPI.login('student@campus.edu', 'student123');
console.log(response.user);
```

---

## 📖 Full Documentation

- **Complete Setup:** `/BACKEND_SETUP.md`
- **Backend README:** `/backend/README.md`
- **API Endpoints:** See Backend README

---

## 🐛 Common Issues

**MongoDB not connecting?**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Port 5000 in use?**
```bash
# Change PORT in .env
PORT=5001
```

**JWT error?**
```bash
# Make sure .env has JWT_SECRET
JWT_SECRET=your_secret_key_here
```

---

**That's it! You're ready to build! 🚀**
