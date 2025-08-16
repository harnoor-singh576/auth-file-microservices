# Distributed File Upload System (Microservices with Node.js, MongoDB Atlas, AWS S3)
This project is a **microservices-based system** built with **Node.js (Express)**, **MongoDB Atlas**, and **AWS S3**.  
It provides **authentication (Auth Service)** and **secure file storage (File Service)** with JWT-based authentication.  

Currently, the system has **two microservices**:

1. **Auth Service**  → Handles user registration, login, and JWT authentication.
2. **File Service**  → Handles file upload (raw binary) to AWS S3 and secure download via presigned URLs.

---

## 🚀 Features

- JWT Authentication (register, login, protected routes)
- MongoDB Atlas integration for user and file metadata
- File upload to AWS S3 using presigned keys
- File size validation (max 50MB)
- User-based file ownership checks
- Microservice-based architecture (Auth + File services communicate via JWT)
- Environment variables managed via `.env`

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Storage**: AWS S3 (buckets, presigned URLs)
- **Auth**: JWT (JSON Web Token)
- **Tools**: Nodemon, dotenv, bcrypt, axios

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/harnoor-singh576/auth-file-microservices.git

### 2. Setup MongoDB Atlas
Create a free MongoDB Atlas cluster
Whitelist your IP in MongoDB Atlas security settings
Create a database user with password
Copy the connection URI and replace <MONGO_URI> in .env

### 3. Setup AWS S3
Create an S3 Bucket
Create an IAM User with access policies:
s3:PutObject
s3:GetObject
Get Access Key ID and Secret Key
Note your AWS region

### 4. Configure .env Files
Refer auth-service/.env.example file
Refer uploadFile-service/.env.example file

### 5. Install Dependencies
cd auth-service && npm install
cd ../uploadFile-service && npm install

### 6. Start services
# Terminal 1
cd auth-service && npm run dev

# Terminal 2
cd file-service && npm run dev


## 📡 API Endpoints
## 🔑 Auth Service

POST /register   -> Register new user
POST /login      -> Login user, returns JWT token
GET  /me         -> Get logged-in user details (requires JWT)

## 📁 File Service
POST /upload?filename=<name>   -> Upload file (binary), requires JWT
GET  /file/:id                 -> Get presigned S3 download URL



