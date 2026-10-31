require('dotenv').config();
const express=require('express');
const jwt = require('jsonwebtoken');
const User=require('../models/usermodel')
  const secret=process.env.secret
const registeruser = async (req, res) => {
    try {
        const {name, email, password } = req.body;

        const user = await User.userregister(name,email, password);

        res.status(201).json({
            message: 'Account created successfully!',
            user: { id: user._id, name: user.name, email: user.email }
        });
    }  catch (err) {
    console.error('REGISTER ERROR:', err);
     if (err.code === 11000) {
        return res.status(409).json({ error: 'Email already exists.' });
    }
    const status = err.message === 'Invalid credentials' ? 401 : 500;
    res.status(status).json({ error: err.message });
}

};

const loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.userlogin(email, password);

    

      const token = jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn: '1h' }
);

        res.status(200).json({
            message: 'Login successful',
            token
        });

    } catch (err) {
        const status = err.message === 'Invalid credentials' ? 401 : 500;
        res.status(status).json({ error: err.message });
    }
};
const userprofile = async (req, res) => {
    try {
        
        const user = await User.findOne({ email: req.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User profile retrieved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
module.exports = { registeruser,loginuser,userprofile };
