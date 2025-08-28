const express = require('express')
const { verifyToken } = require('../middlewares/auth')

const router = express.Router()

/**
 * Compute a simple Levenshtein distance between two strings. This helper is used
 * to illustrate the fuzzy matching concept described in the design document【695031078982543†L209-L214】. In
 * production you might use a library such as `fast-levenshtein` or perform
 * more advanced matching with context and weights.
 */
const levenshtein = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => [])
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      )
    }
  }
  return matrix[a.length][b.length]
}

/**
 * @swagger
 * tags:
 *   name: Comparison
 *   description: Endpoints for comparing extracted fields against system data
 */

/**
 * @swagger
 * /compare:
 *   post:
 *     summary: Compare extracted fields with system data
 *     tags: [Comparison]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - extracted_fields
 *               - system_data
 *             properties:
 *               extracted_fields:
 *                 type: object
 *                 additionalProperties: true
 *               system_data:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Comparison report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   target:
 *                     type: string
 *                   system:
 *                     type: string
 *                   distance:
 *                     type: integer
 *                   passed:
 *                     type: boolean
 */
router.post('/', verifyToken, (req, res) => {
  const { extracted_fields: extracted, system_data: system } = req.body
  if (!extracted || !system) {
    return res.status(400).json({ message: 'extracted_fields and system_data are required' })
  }
  const report = {}
  Object.keys(extracted).forEach((key) => {
    const target = extracted[key]
    const sys = system[key]
    const distance = target && sys ? levenshtein(String(target), String(sys)) : null
    const passed = distance !== null ? distance <= 2 : false
    report[key] = {
      target,
      system: sys,
      distance,
      passed,
    }
  })
  return res.json(report)
})

module.exports = router