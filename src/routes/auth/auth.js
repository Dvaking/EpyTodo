const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

const internalServerError = (res) => {
    res.status(500).json({ msg: "Internal server error" });
}

const insertValueToDatabase =  (res, email, hash, name, firstname) => {
    pool.query(`INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)`, [email, hash, name, firstname], (error, result) => {
        if (error) {
            internalServerError(res);
        } else {
            const token = jwt.sign({ id: result.insertId }, process.env.SECRET, { expiresIn: "1h" });
            res.status(200).json({ token: token });
        }
    });
}

const generatingNewUser = (res, email, password, name, firstname) => {
    bcrypt.genSalt(10, (error, salt) => {
        if (error) {
            internalServerError(res);
        } else {
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) {
                    internalServerError(res);
                } else {
                    insertValueToDatabase(res, email, hash, name, firstname);
                }
            });
        }
    });
}

// Register
router.post('/register', (req, res) => {
    const { email, name, firstname, password } = req.body;

    if (!email || !name || !firstname || !password) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }
    // Check if user exists
    pool.query(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
        if (error) {
            internalServerError(res);
        } else {
            if (result.length !== 0) {
                res.status(400).json({ msg: "Account already exists" });
            } else {
                generatingNewUser(res, email, password, name, firstname);
            }
        }
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }
    pool.query(`SELECT * FROM user WHERE email = ?`, [email], (error, result) => {
        if (error) {
            internalServerError(res);
        } else {
            if (result.length === 0) {
                res.status(401).json({ msg: "Invalid Credentials" });
            } else {
                bcrypt.compare(password, result[0].password, (error, isMatch) => {
                    if (error) {
                        internalServerError(res);
                    }
                    if (isMatch) {
                        const token = jwt.sign({ id: result[0].id }, process.env.SECRET, { expiresIn: "1h" });
                        res.status(200).json({ token: token });
                    } else {
                        res.status(401).json({ msg: "Invalid Credentials" });
                    }
                });
            }
        }
    });
});

module.exports = router;

