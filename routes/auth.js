const bcrypt = require('bcryptjs')
const Admin = require('../models/Admin')
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

		return res.status(201).json({ message: 'Registration successful' })
	} catch (err) {
		return res.status(500).send({ message: err.message })
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
		let user = await Admin.findOne({ email })
		let role = 'admin'

		if (!user) {
			user = await Employee.findOne({ email })
			role = 'staff'
		}

		if (!user) {
			return res
				.status(401)
				.json({ message: 'Invalid credentials or user not found' })
		}

		// 2. Compare the password
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const payload = { email, role }

		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '10m' },
			(err, token) => {
				if (err) throw err
				return res.status(201).json({ token, message: 'Login successful' })
			}
		)
	} catch (err) {
		return res.status(500).json({ message: err.message })
	}
}
