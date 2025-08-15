const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth')

dotenv.config();

const app = express();

// Middlewares
app.use((req,res,next)=>{
    console.log(`${req.method} ${req.path}`);
    next();
    
});
app.use(cors());
app.use(express.json()); //Parse JSON bodies

// DB Connection
connectDB();

// Auth routes in order to match: /register, /login, /me
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🚀 Auth Service running on port ${PORT}`))

