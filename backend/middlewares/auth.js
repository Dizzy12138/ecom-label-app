const jwt = require('jsonwebtoken')

/**
 * Middleware to verify JWT access tokens. The token should be passed in the
 * `Authorization` header as a Bearer token. Upon successful verification the
 * decoded token payload is attached to `req.user` and the request continues.
 * Otherwise a 401/400 response is returned. See the DEV post referenced in
 * the README for details on how JWTs work and why they enable stateless
 * authentication【374393436294486†L310-L344】.
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No token provided' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'change-this-secret'
    const verified = jwt.verify(token, secret)
    req.user = verified
    return next()
  } catch (err) {
    return res.status(400).json({ message: 'Invalid Token' })
  }
}