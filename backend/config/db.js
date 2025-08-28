const mongoose = require('mongoose')

/**
 * Connects to a MongoDB instance using the URI stored in the environment.
 * If no URI is provided the process exits with an error. See the README
 * for details on configuring the database connection.
 */
const connectDB = async () => {
  const { MONGODB_URI } = process.env
  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error('No MONGODB_URI specified in environment variables')
    process.exit(1)
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    // eslint-disable-next-line no-console
    console.log('MongoDB connected')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error connecting to MongoDB', err.message)
    process.exit(1)
  }
}

module.exports = connectDB