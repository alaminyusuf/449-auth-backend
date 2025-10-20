const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
	let token

	// 1. Check if token exists in the 'Authorization' header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			// Get token from header (Format: "Bearer <token>")
			token = req.headers.authorization.split(' ')[1]

			// 2. Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET)

			// 3. Attach user payload to the request (including role)
			req.user = decoded

			next() // Proceed to the next middleware/route handler
		} catch (error) {
			res.status(401).json({ message: 'Not authorized, token failed' })
		}
	}

	if (!token) {
		res.status(401).json({ message: 'Not authorized, no token' })
	}
}

const admin = (req, res, next) => {
	// Check if the user attached by 'protect' middleware has the admin role
	if (req.user && req.user.role === 'admin') {
		next()
	} else {
		res.status(403).json({ message: 'Not authorized as an admin' })
	}
}

module.exports = { protect, admin }
