# CampusLink Backend API

A comprehensive Express.js + MongoDB backend for CampusLink - A Centralized Student Utility Hub.

## Features

- **User Authentication** - JWT-based auth with role-based access (Student/Admin)
- **Announcements** - Campus-wide announcements with categories and channels
- **Lost & Found** - Item reporting and search system
- **Timetable** - Personal schedule management
- **Complaints** - Hostel complaint system with status tracking
- **Skill Exchange** - Peer-to-peer learning marketplace

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for frontend integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional dependencies if needed:
```bash
npm install cors nodemon --save-dev
```

3. Ensure you have a MongoDB Atlas account and connection string

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify JWT token

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create announcement (Admin only)
- `PUT /api/announcements/:id` - Update announcement (Admin only)
- `DELETE /api/announcements/:id` - Delete announcement (Admin only)
- `PATCH /api/announcements/:id/pin` - Toggle pin status (Admin only)
- `GET /api/announcements/admin/stats` - Get statistics (Admin only)

### Lost & Found
- `GET /api/lost-found` - Get all items
- `GET /api/lost-found/:id` - Get single item
- `POST /api/lost-found` - Report new item
- `PUT /api/lost-found/:id` - Update item
- `DELETE /api/lost-found/:id` - Delete item
- `PATCH /api/lost-found/:id/resolve` - Mark as resolved
- `GET /api/lost-found/user/my-items` - Get user's items
- `GET /api/lost-found/admin/stats` - Get statistics (Admin only)

### Timetable
- `GET /api/timetable` - Get user's timetable
- `GET /api/timetable/:id` - Get single entry
- `POST /api/timetable` - Create new entry
- `PUT /api/timetable/:id` - Update entry
- `DELETE /api/timetable/:id` - Delete entry
- `GET /api/timetable/day/:day` - Get entries for specific day
- `POST /api/timetable/bulk` - Bulk create entries
- `DELETE /api/timetable/clear/all` - Clear all entries

### Complaints
- `GET /api/complaints` - Get complaints
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Submit new complaint
- `PATCH /api/complaints/:id/status` - Update status (Admin only)
- `POST /api/complaints/:id/comments` - Add comment
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `GET /api/complaints/admin/stats` - Get statistics (Admin only)

### Skill Exchange
- `GET /api/skill-exchange/teachers` - Get all peer teachers
- `GET /api/skill-exchange/teachers/:id` - Get single teacher
- `POST /api/skill-exchange/teachers` - Add new teacher
- `PUT /api/skill-exchange/teachers/:id` - Update teacher
- `DELETE /api/skill-exchange/teachers/:id` - Delete teacher
- `PATCH /api/skill-exchange/teachers/:id/verify` - Verify teacher (Admin only)
- `GET /api/skill-exchange/requests` - Get contact requests
- `POST /api/skill-exchange/requests` - Create new request
- `PATCH /api/skill-exchange/requests/:id/status` - Update request status
- `PATCH /api/skill-exchange/requests/:id/feedback` - Add feedback/rating
- `GET /api/skill-exchange/admin/stats` - Get statistics (Admin only)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Models

### User
- name, email, password, role (student/admin), avatar, isActive

### Announcement
- title, description, category, channel, createdBy, isPinned, priority, views

### LostFoundItem
- title, description, category, type (lost/found), location, reportedBy, image, status

### TimetableEntry
- userId, subject, day, startTime, endTime, location, color, type, instructor

### Complaint
- title, description, category, status, priority, submittedBy, assignedTo, comments

### PeerTeacher
- name, email, skills, type (peer/senior), availability, bio, rating, isVerified

### ContactRequest
- teacherId, requesterName, skill, message, status, rating, feedback

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your-mongodb-cloud-uri
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

1. Install nodemon for development:
```bash
npm install -g nodemon
```

2. Run in development mode:
```bash
npm run dev
```

3. The server will automatically restart on file changes.

## Production Deployment

1. Set environment variables
2. Ensure you have an active internet connection for MongoDB Atlas
3. Run: `npm start`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- CORS configuration
- Request rate limiting (can be added)

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update this README for new endpoints
5. Test all endpoints before committing