const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const auth = require('../middleware/auth');
const requireEmailAndPassword = require('../middleware/requireEmailAndPassword')

const router = express.Router();

/**
 *  POST /register
 * Registers a new user
 */

router.post('/register', requireEmailAndPassword, async(req,res)=>{
    console.log(req.body);
    try {
        const{email, password} = req.body;
        const existingUser = await User.findOne({email});
        // Check if user exists
        if(existingUser){
            return res.status(409).json({
                error: 'Email already registered'
            })
        }

        // Hash password
        const saltRounds = 8;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // save user
        const user = await User.create({email, password: hashPassword});
        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email
            }
        })


    } catch (error) {
        console.error('❌ Register Error', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /login
 * Authenticates a user & returns JWT
 */
router.post('/login', requireEmailAndPassword, async(req,res)=>{
    try {
        const{email, password} = req.body;

        // Check user exists
        const user = await User.findOne({email}).select('+password');;
        if(!user){
            return res.status(401).json({
                error: 'Invalid Credentials'
            })
        }

        // Compare Password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({
                error: 'Invalid Credentials'
            })
        }

        // create JWT
        const token = jwt.sign(
            {userId: user._id.toString(), email: user.email},
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: process.env.JWT_EXPIRES_IN || '1h'
            }
        );

        return res.json({token});

    } catch (error) {
        console.error('❌ Login Error', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /me
 * Returns currently logged-in user's basic info
 */

router.get('/me',auth, (req,res)=>{
    return res.json({
        userId: req.user.userId,
        email: req.user.email
    })
});

module.exports = router;