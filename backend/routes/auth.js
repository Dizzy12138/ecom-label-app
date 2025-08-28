const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Username already exists
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    // Check if username exists
    const existing = await User.findOne({ username })
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' })
    }
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)
    const newUser = new User({ username, password: hashed })
    await newUser.save()
    return res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log a user in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    // Generate JWT token (expires in 1 hour)
    const secret = process.env.JWT_SECRET || 'change-this-secret'
    const token = jwt.sign({ userId: user._id, username: user.username }, secret, { expiresIn: '1h' })
    return res.json({ token })
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router