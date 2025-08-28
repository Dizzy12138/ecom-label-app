const mongoose = require('mongoose')

/**
 * A minimal User model for storing authentication credentials. In a real
 * application you might also include roles, email verification, password
 * reset tokens, or other profile information. Passwords are stored as
 * salted/bcrypt hashes. See routes/auth.js for registration and login logic.
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('User', UserSchema)