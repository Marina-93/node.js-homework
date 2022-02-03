const express = require('express');
const createError = require('http-errors');

const { User, schems } = require('../../models/user');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const { error } = schems.registet.validate(req.body);
        if (error) {
            throw new createError(400, error.message)
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            throw new createError(409, 'Email in use');
        }
        const result = await User.create({ email, password })
        res.status(201).json({
            user: {
                email
                // subscription
            }
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router;