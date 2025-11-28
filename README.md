# 🏙️ MySociety – Residential Community App

A private community application for housing societies where residents can post updates, raise complaints, view announcements, and access important contacts.  
Built for the MAD Hackathon using **React Native**, **Node.js**, and **MongoDB**.

---

## Features

### Residents
- Sign up with flat number, block/tower, and name  
- Create posts under categories:
  - Maintenance
  - Buy/Sell
  - Lost & Found
  - Events
  - Others
- Upload images with posts  
- Comment on posts  
- Report inappropriate posts  

---

### Feed & Filters
- Main feed sorted by latest posts  
- Filter posts by:
  - Category  
  - Block/Tower  
- Mute notifications from selected categories  

---

### Admin Panel
- Pin important notices to the top  
- View reported posts  
- Remove inappropriate posts  

---

### Extras
- Important contacts section (security, office, plumber, electrician)  
- Mobile-friendly UI  
- Secure authentication (JWT)

---

## Tech Stack

### **Frontend (React Native)**
- React Native  
- Expo  
- Axios  
- Context API / Redux (optional)

### **Backend (Node.js / Express)**
- Express.js  
- Mongoose  
- Cloudinary (for images)  
- JWT Authentication  
- dotenv  
- Nodemon  

### **Database**
- MongoDB Atlas  
- Mongoose ODM  




## Backend Setup

### 1. Clone the project
```bash
git clone https://github.com/<your-username>/mysociety.git
cd backend
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create a .env file
```ini
MONGO_URI=your-mongodb-url
JWT_SECRET=your-secret-key
PORT=5000
```
### 4. Start the backend server
```bash
npm run dev
```
If successful, you should see:
```ini
[dotenv] injecting env...
Database Connected Successfully
Server running on port 5000
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Scan the QR code in Expo Go (for Android) or use the iOS simulator.

## API Overview

### Auth Routes
| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /auth/register | Register a new user |
| POST   | /auth/login    | Login & receive JWT |

### Post Routes
| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /posts/create  | Create a new post   |
| GET    | /posts         | Get all posts       |
| GET    | /posts/:id    | Get one post        |
| DELETE | /posts/:id    | Delete a post (admin only) |
| PUT    | /posts/pin/:id | Pin/unpin a post (admin only) |

### Comment Routes
| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /comments/create| Add a comment       |
| GET    | /comments/:post_id| Get comments for post|

### Report Routes
| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /reports/create| Report a post       |
| GET    | /reports       | View all reports (admin)

## Testing with Postman
Import the API endpoints and test:


```bash
# Authentication
POST /auth/register
POST /auth/login
```

```bash
# Post Routes
POST /posts/create
GET  /posts
GET  /posts/:id
DELETE /posts/:id (admin)
PUT /posts/pin/:id (admin)
```
```bash
# Comment Routes
POST /comments/create
GET  /comments/:post_id
```
```bash
# Report Routes
POST /reports/create
GET  /reports (admin)
```

```bash
# Admin Routes
GET /admin/posts
GET /admin/reports
```

## Security Features
Password hashing using bcrypt

Routes protected using JWT authentication

Admin-only endpoints

Input validation & role-based access

## Team
- Devaansh Kathuria
- Aryan Verma