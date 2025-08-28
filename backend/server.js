require('dotenv').config()
const express = require('express')
const cors = require('cors')
const promBundle = require('express-prom-bundle')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const connectDB = require('./config/db')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const authRoutes = require('./routes/auth')
const analyzeRoutes = require('./routes/analyze')
const compareRoutes = require('./routes/compare')
const rulesRoutes = require('./routes/rules')

const app = express()

// ---- 仅保留一次连接，并在成功后初始化管理员 ----
async function initAdmin() {
  const username = process.env.ADMIN_USER || 'admin'
  const password = process.env.ADMIN_PASS || 'admin123'
  const exists = await User.findOne({ username })
  if (!exists) {
    const hash = await bcrypt.hash(password, 10)
    await User.create({ username, passwordHash: hash })
    console.log(`[INIT] Admin created -> ${username}/${password}`)
  } else {
    console.log('[INIT] Admin already exists, skip')
  }
}

connectDB()
  .then(() => initAdmin())
  .catch((e) => {
    console.error('[DB] connect/init error:', e)
    process.exit(1)
  })
// -----------------------------------------------------

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  buckets: [0.005, 0.01, 0.1, 0.5, 1, 2, 5],
})
app.use(metricsMiddleware)

// APIs
app.use('/api/auth', authRoutes)
app.use('/api/analyze', analyzeRoutes)
app.use('/api/compare', compareRoutes)
app.use('/api/rules', rulesRoutes)

// Swagger
const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'E-commerce Label Recognition API',
    version: '1.0.0',
    description:
      'REST API for uploading images, extracting fields, comparing against system data and managing matching rules.',
  },
  servers: [{ url: '/api', description: 'API server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
}
const swaggerSpec = swaggerJsdoc({ definition: swaggerDefinition, apis: ['./routes/*.js'] })
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }))

app.get('/', (req, res) => res.json({ message: 'Label recognition API is up and running.' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Backend service listening on port ${PORT}`))
