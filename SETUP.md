# CampusLink - Full Stack Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### 1. 1. **MongoDB Connection Error**
   - Ensure your MongoDB Atlas connection string is correct
   - Check that your IP address is whitelisted in MongoDB Atlas
   - Check connection string in `.env` filene and Install Dependencies

```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 2. Environment Setup

**Backend (.env):**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/campuslink?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Database Setup

```bash
# No need to start local MongoDB - we're using MongoDB Atlas cloud service

# Seed the database with sample data
cd Backend
npm run seed
```

### 4. Start Development Servers

**Option 1: Use the batch script (Windows)**
```bash
# From project root
start-dev.bat
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend  
cd Frontend
npm run dev
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Lost & Found
- `GET /api/lost-found` - Get all items
- `POST /api/lost-found` - Report new item
- `PUT /api/lost-found/:id` - Update item
- `DELETE /api/lost-found/:id` - Delete item

### Timetable
- `GET /api/timetable` - Get user's timetable
- `POST /api/timetable` - Add timetable entry
- `PUT /api/timetable/:id` - Update entry
- `DELETE /api/timetable/:id` - Delete entry

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Submit complaint
- `PUT /api/complaints/:id` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint

### Skill Exchange
- `GET /api/skill-exchange/teachers` - Get peer teachers
- `POST /api/skill-exchange/teachers` - Add teacher profile
- `GET /api/skill-exchange/contact-requests` - Get contact requests
- `POST /api/skill-exchange/contact-requests` - Send contact request

## 🧪 Test Credentials

After running the seeder, you can use these credentials:

**Admin Account:**
- Email: `admin@university.edu`
- Password: `admin123`

**Student Accounts:**
- Email: `john.doe@university.edu` | Password: `student123`
- Email: `jane.smith@university.edu` | Password: `student123`
- Email: `alex.kumar@university.edu` | Password: `student123`

## 🛠️ Development Features

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TanStack Query** for API state management
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript support
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### API Integration
- **Axios** for HTTP requests
- **Custom hooks** for each feature
- **Automatic token management**
- **Error handling** with toast notifications
- **Request/Response interceptors**

## 📱 Application URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **MongoDB**: MongoDB Atlas Cloud Database

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod --version`
   - Check connection string in `.env`

2. **Port Already in Use**
   - Backend: Change `PORT` in `Backend/.env`
   - Frontend: Change port in `Frontend/vite.config.ts`

3. **CORS Issues**
   - Ensure backend CORS is configured for frontend URL
   - Check proxy settings in `vite.config.ts`

4. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check JWT_SECRET in backend `.env`

### Reset Database
```bash
cd Backend
npm run seed
```

## 🎯 Next Steps

1. **Test all features** with the provided credentials
2. **Customize styling** and branding
3. **Add more features** as needed
4. **Deploy to production** when ready

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure you have an active internet connection for MongoDB Atlas
4. Check environment variables are set correctly