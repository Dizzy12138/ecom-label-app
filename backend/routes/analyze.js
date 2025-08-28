const express = require('express')
const { verifyToken } = require('../middlewares/auth')
const { analyzeImages } = require('../services/analysisService')

const router = express.Router()

/**
 * This route forwards image payloads to an external analysis service
 * (e.g. OCR/VLM pipeline) configured via MODEL_API_URL. When the
 * environment variable is missing or the remote call fails, a mocked
 * response is returned so the frontend can still function during
 * development.
 */

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Endpoints for image analysis and field extraction
 */

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze one or more images and extract fields
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Base64 encoded image or URL
 *               type:
 *                 type: string
 *                 enum: [auto, carton, product, address, shippingmark, origin]
 *                 description: Optional hint for the label type
 *     responses:
 *       200:
 *         description: Structured analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                 barcodes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbology:
 *                         type: string
 *                       text:
 *                         type: string
 *                       bbox:
 *                         type: array
 *                         items:
 *                           type: number
 *                       conf:
 *                         type: number
 *                 texts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                       bbox:
 *                         type: array
 *                         items:
 *                           type: number
 *                       conf:
 *                         type: number
 *                 matches:
 *                   type: object
 *                 flags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 verdict:
 *                   type: string
 */
router.post('/', verifyToken, async (req, res) => {
  const { images, type } = req.body
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: 'images array is required' })
  }
  try {
    const result = await analyzeImages(images, type)
    return res.json(result)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Error during analysis' })
  }
})

module.exports = router
