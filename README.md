# FitLife Tracker — Assignment 4 (Sessions & Security)

This project is a **full-stack web application** built with **Node.js** + **Express** and **MongoDB**.

## Features
- **CRUD** operations via Web UI (Create, Update, Delete)
- **Sessions-based Authentication** (Login/Logout)
- **Security features**:
  - Session ID stored in HttpOnly, Secure cookie
  - Password hashing with bcrypt
- **MongoDB** database (native MongoDB driver)
- Environment variables (**PORT**, **MONGO_URI**, **SESSION_SECRET**, **NODE_ENV**)
- Deployed to **Render** with a public URL

## Deployed URL
- **Public URL:** [https://web-2-ass-3-p-2.onrender.com](https://web-2-ass-3-p-2.onrender.com)

---

## Tech Stack
- **Node.js**
- **Express**
- **MongoDB Atlas (native driver)**
- **bcrypt** for password hashing
- **Sessions** for authentication
- **HTML / CSS / JavaScript** (Frontend)
- **Environment Variables** for secure settings

## Project Structure
```bash
WEB_2_ASS_3_P_2/
├── server.js
├── app.js
├── database/
│   └── mongo.js
├── routes/
│   └── workouts.js
│   └── auth.js
├── middleware/
│   └── logger.js
│   └── requireAuth.js
├── views/
│   ├── index.html
│   └── about.html
│   └── 404.html
├── public/
│   ├── style.css
│   └── app.js
├── .gitignore
├── package.json
└── README.md
