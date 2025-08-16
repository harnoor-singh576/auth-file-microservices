# System Architecture

This project follows a **microservices architecture**.  
Each service runs independently, connects to **MongoDB Atlas**, and communicates using **HTTP (REST APIs)**.  

---

## 🔹 Components

1. **Auth Service**
   - Manages user registration and login
   - Issues **JWT tokens**
   - Stores user credentials in MongoDB Atlas

2. **File Service**
   - Handles file upload and download
   - Uploads files to **AWS S3**
   - Stores file metadata (filename, owner, S3 key) in MongoDB Atlas
   - Requires JWT authentication from Auth Service

3. **MongoDB Atlas**
   - Stores:
     - User data (Auth Service)
     - File metadata (File Service)

4. **AWS S3**
   - Stores actual file objects
   - Accessed using **pre-signed URLs**

---

## 🔄 Data Flow

### 1. User Authentication
(Client) → POST /register → Auth Service → MongoDB Atlas
(Client) → POST /login → Auth Service → JWT Token


### 2. File Upload
(Client with JWT) → POST /upload → File Service → AWS S3
↳ Save metadata in MongoDB Atlas


### 3. File Download
(Client with JWT) → GET /file/:id → File Service → MongoDB Atlas
↳ Generate pre-signed URL → AWS S3
↳ Return secure download link


---

## 📊 Simple Diagram

```plaintext
          +-------------+             +------------------+
          |   Client    | <---------> |  Auth Service    |
          +-------------+             |  (JWT Provider)  |
                 |                     +------------------+
                 | JWT
                 v
          +-------------+             +------------------+
          |   Client    | <---------> |  File Service    |
          +-------------+             |  (Uploads Files) |
                 |                     +------------------+
                 | metadata                  |
                 v                           v
        +----------------+           +----------------+
        | MongoDB Atlas  |           |   AWS S3       |
        | (Users + Files)|           | (File Storage) |
        +----------------+           +----------------+
