const User = require('../models/User') // Assume path
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'YOUR_SECRET_KEY' // MUST be secured in .env in production

// @route POST /api/auth/register
exports.register = async (req, res) => {
	const { username, email, password } = req.body

	try {
		// 1. Check if user already exists
		let user = await User.findOne({ email })
		if (user) {
			return res.status(400).json({ msg: 'User already exists' })
		}

		user = new User({ username, email, password })

		// 2. Hash Password
		const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(password, salt)

		// 3. Save User
		await user.save()

		// 4. Create and return JWT (optional for registration, but common)
		const payload = { user: { id: user.id } }

		jwt.sign(
			payload,
			'YOUR_SECRET_KEY',
			{ expiresIn: '1h' },
			(err, token) => {
				if (err) throw err
				res.status(201).json({ token, msg: 'Registration successful' })
			}
		)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server error')
	}
}
// ---------------------------
// 2. LOGIN
// ---------------------------
// @route POST /api/auth/login
exports.login = async (req, res) => {
	const { email, password } = req.body

	try {
		// 1. Check for user existence
		const user = await User.findOne({ email })
		if (!user) {
			return res.status(400).json({ msg: 'Invalid Credentials' })
		}

		// 2. Compare passwords
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).json({ msg: 'Invalid Credentials' })
		}

		// 3. Check for 2FA status
		if (user.isTwoFactorEnabled) {
			// Initiate 2FA verification flow
			return res.json({
				msg: '2FA required',
				twoFactorEnabled: true,
				// You might send a temporary token here to identify the user for 2FA step
				// A better approach is often to use the email in the next step.
			})
		}

		// 4. Generate and return JWT (Standard Login Success)
		const payload = { user: { id: user.id } }

		jwt.sign(
			payload,
			'YOUR_SECRET_KEY',
			{ expiresIn: '1h' },
			(err, token) => {
				if (err) throw err
				res.json({
					token,
					twoFactorEnabled: false,
					msg: 'Login successful',
				})
			}
		)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server error')
	}
}
