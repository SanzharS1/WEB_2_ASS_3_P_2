FitLife Tracker — Final Project (Production Web Application)

This project is a full-stack web application built with Node.js, Express, and MongoDB, designed to track fitness workouts with authentication, role-based access control, and secure API endpoints.

Features

CRUD operations via Web UI (Create, Update, Delete)

Sessions-based Authentication (Login/Logout)

Role-based Access Control (Admin/User)

Security Features:

Session ID stored in HttpOnly, Secure cookies

Password hashing with bcrypt

MongoDB database (native MongoDB driver)

Environment Variables for secret management

Pagination for handling large datasets (Workouts list)

Protected API endpoints: No public update or delete operations

Deployed URL

Public URL: https://web-2-ass-3-p-2.onrender.com

Tech Stack

Node.js

Express

MongoDB Atlas (native driver)

bcrypt for password hashing

Sessions for authentication and managing user sessions

HTML / CSS / JavaScript (Frontend)

Environment Variables for storing sensitive data securely (e.g., database URI, session secret)

dotenv to load environment variables from a .env file

Project Structure
WEB_2_ASS_3_P_2/
├── server.js                  # Entry point to start the application
├── app.js                      # Main application logic and routing
├── database/
│   └── mongo.js               # MongoDB connection handler
├── routes/
│   └── workouts.js            # Workouts API routes (CRUD operations)
│   └── auth.js                # Authentication API routes (Login, Register, Logout)
├── middleware/
│   └── logger.js              # Logger middleware to log incoming requests
│   └── requireAuth.js         # Middleware to check for authentication
│   └── requireRole.js         # Middleware to check user role (Admin/User)
├── controllers/
│   └── workoutsController.js  # Logic for handling workouts CRUD operations
│   └── authController.js      # Logic for authentication (login, logout, register)
├── config/
│   └── sessions.js            # Session management and configuration
├── views/
│   ├── index.html             # Home page of the application
│   ├── about.html             # About page with project description
│   └── 404.html               # 404 error page
├── public/
│   ├── style.css              # Main CSS file for styling the app
│   └── app.js                 # Frontend JavaScript file to handle UI actions
├── .gitignore                 # List of files to ignore in version control
├── .env                       # Environment variables (for secrets and database connection)
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation (this file)

Environment Variables

This project uses the following environment variables (stored in the .env file):

MONGO_URI: MongoDB URI for database connection (can be MongoDB Atlas or local).

MONGO_DB: MongoDB database name (e.g., fitlife).

SESSION_SECRET: Secret key for managing sessions.

NODE_ENV: Environment mode (development or production).

SEED_ADMIN_EMAIL: Email for the admin user (used for seeding the database).

SEED_ADMIN_PASSWORD: Password for the admin user (used for seeding the database).

SEED_USER_EMAIL: Email for the regular user (used for seeding the database).

SEED_USER_PASSWORD: Password for the regular user (used for seeding the database).

Setup Instructions
1. Clone the repository:
git clone https://github.com/yourusername/fitlife-tracker.git
cd fitlife-tracker

2. Install dependencies:
npm install

3. Set up environment variables:

Create a .env file in the root directory and add the following variables:

PORT=3000
MONGO_URI=mongodb+srv://your-db-user:your-db-password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=fitlife
SESSION_SECRET=super_super_long_random_secret_key_2026
NODE_ENV=development

SEED_ADMIN_EMAIL=admin@fitlife.com
SEED_ADMIN_PASSWORD=admin123
SEED_USER_EMAIL=user@fitlife.com
SEED_USER_PASSWORD=user123

4. Run the application:

Start the application in development mode:

npm start

5. Access the application:

Once the server is running, navigate to http://localhost:3000
 to access the app.

Authentication & Authorization

Login: Login using the email and password defined in the .env file.

Roles: There are two roles — admin and user. The admin has full access to all workouts, while the user can only modify their own workouts.

Session: Session data is stored in HttpOnly, Secure cookies to prevent client-side access and provide security.

Security Features

Password Hashing: Passwords are hashed using bcrypt before being stored in the database.

Role-based Access Control: Admins can access and modify all data, while users are restricted to their own data.

Protected API Endpoints: Write endpoints (POST, PUT, DELETE) are protected and require the user to be authenticated.

Deployment

The application has been deployed to Render with a public URL:

Public URL: https://web-2-ass-3-p-2.onrender.com

Database Setup & Seed Data

The database is seeded with an admin and a user account during the initial setup. The application will use these accounts to authenticate users during login. If the workouts collection is empty, the app will automatically add 20 workout entries.