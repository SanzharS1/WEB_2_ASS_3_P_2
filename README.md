# FitLife Tracker — Assignment 3 Part 2 (Deployment + Production Web UI)

Full-stack web application built with **Node.js + Express** and **MongoDB (Atlas)**.  
Includes a **Production Web UI** that demonstrates **full CRUD** (Create / Read / Update / Delete) without Postman.

## Deployed URL
- **Public URL:** https://web-2-ass-3-p-2.onrender.com

---

## Features (Assignment Requirements)
✅ Deployed to a public hosting platform (Render)  
✅ Uses `process.env.PORT` in production  
✅ Uses environment variables (no hardcoded secrets)  
✅ MongoDB connection works in production (MongoDB Atlas)  
✅ Production Web UI at `/`  
✅ UI demonstrates CRUD through the browser (no Postman)  
✅ Data displayed in a table/catalog  
✅ Backend API with CRUD endpoints  

---

## Tech Stack
- Node.js
- Express
- MongoDB Atlas (native MongoDB driver)
- HTML / CSS / JavaScript (fetch API)

---

## Project Structure
```txt
WEB_2_ASS_3_P_2/
├── server.js
├── app.js
├── database/
│   └── mongo.js
├── routes/
│   └── workouts.js
├── middleware/
│   └── logger.js
├── views/
│   ├── index.html
│   └── about.html
├── public/
│   ├── style.css
│   └── app.js
├── .gitignore
├── package.json
└── README.md
