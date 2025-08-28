const express = require('express')
const { verifyToken } = require('../middlewares/auth')

const router = express.Router()

// In-memory rules store; in production this should be persisted in a database.
let rulesStore = {
  fbaPattern: '^[A-Z0-9\-]{6,20}$',
  fnskuPattern: '^X[0-9A-Z]{9,13}$',
  poPattern: '^[A-Z]{2}\d{6,}$',
  emailPattern: '^[^@\s]+@[^@\s]+\\.[^@\s]+$',
  phonePattern: '^\\+?[0-9\\-()\\s]{6,20}$',
  originPhrases: {
    CN: ['MADE IN CHINA', 'HECHO EN: CHINA'],
    VN: ['MADE IN VIETNAM'],
    TH: ['MADE IN THAILAND'],
  },
}

/**
 * @swagger
 * tags:
 *   name: Rules
 *   description: Manage matching and validation rules
 */

/**
 * @swagger
 * /rules:
 *   get:
 *     summary: Get the current validation rules
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current rules
 */
router.get('/', verifyToken, (req, res) => {
  res.json(rulesStore)
})

/**
 * @swagger
 * /rules:
 *   put:
 *     summary: Update the validation rules
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated rules
 */
router.put('/', verifyToken, (req, res) => {
  rulesStore = { ...rulesStore, ...req.body }
  res.json(rulesStore)
})

module.exports = router