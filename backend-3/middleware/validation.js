const { check, validationResult } = require('express-validator');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.secret;
const validateUser = [
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }).withMessage('Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const authorize = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization token required'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, secret);

        if (!decoded || !decoded.email) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        req.email = decoded.email;
        next();

    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

module.exports ={ validateUser,authorize} ;