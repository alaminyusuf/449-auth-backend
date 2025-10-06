const bcrypt = require('bcryptjs')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

// @route POST /api/auth/register
exports.register = async (req, res) => {
	const { username, email, password } = req.body

	try {
		// 1. Check if user already exists
		let user = await User.findOne({ email })
		if (user) {
			return res.status(400).json({ message: 'User already exists' })
		}

		user = new User({ username, email, password })

		// 2. Hash Password
		const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(password, salt)

		// 3. Save User
		await user.save()

		res.status(201).json({ message: 'Registration successful' })
	} catch (err) {
		console.error(err.message)
		res.status(500).send({ message: err.message })
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
			return res
				.status(400)
				.json({ message: 'Invalid Credentials, Not Found' })
		}

		// 2. Compare passwords
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).send({ message: 'Invalid Credentials' })
		}

		const payload = { email }

		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '10m' },
			(err, token) => {
				if (err) throw err
				res.status(201).json({ token, message: 'Registration successful' })
			}
		)
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ message: err.message })
	}
}
