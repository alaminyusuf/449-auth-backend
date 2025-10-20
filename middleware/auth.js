const jwt = require('jsonwebtoken')

// Middleware to verify JWT and attach user data to the request
const protect = (req, res, next) => {
	let token
	// 1. Get token from header
	// The token is typically sent as 'Bearer TOKEN_STRING'
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1]
	}

	// 2. Check if no token
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' })
	}

	try {
		// 3. Verify token
		// Use the same JWT_SECRET used during login/registration
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// 4. Attach user data to request object
		// The payload we signed was { user: { id: user.id } }
		req.user = decoded.user

		// 5. Continue to the next middleware or route handler
		next()
	} catch (err) {
		// If verification fails (e.g., token expired, secret is wrong)
		res.status(401).json({ msg: 'Token is not valid' })
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

exports.module = { protect, admin }
