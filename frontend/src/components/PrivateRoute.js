import React from 'react'
import { Navigate } from 'react-router-dom'

/**
 * Simple private route component. It checks for the existence of a JWT token in
 * local storage and either renders the child component or redirects the user
 * back to the login page. This pattern helps protect routes on the client
 * without relying solely on server-side checks, but does not replace
 * server‑side authorisation.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default PrivateRoute
