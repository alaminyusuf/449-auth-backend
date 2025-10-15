const nodemailer = require('nodemailer')
const OTP = require('../models/OTP')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

// --- Email Transporter Setup ---
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

/**
 * Generates a random numeric OTP.
 */
function generateOTP(length = 6) {
	const min = 10 ** (length - 1)
	const max = 10 ** length - 1
	const otp = Math.floor(Math.random() * (max - min + 1)) + min
	return String(otp)
}

/**
 * Generates an OTP, stores it in MongoDB, and emails it.
 */
exports.sendOTPEmail = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1]
	const { email } = jwt.decode(token)

	try {
		const otp = generateOTP(6)

		// 1. Delete any existing OTP for this email
		await OTP.deleteMany({ email })

		// 2. Save the new OTP to the database (TTL handles expiry)
		const newOTP = new OTP({ email, otp })
		await newOTP.save()

		// 3. Email content
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Your One-Time Password (OTP) for Verification',
			html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
		}

		// 4. Send the email
		await transporter.sendMail(mailOptions)

		res.status(200).json({ message: 'OTP sent successfully to email.' })
	} catch (error) {
		console.error('Error in sendOTPEmail:', error)
		res
			.status(500)
			.json({ message: 'Failed to send OTP email.', error: error.message })
	}
}

/**
 * Verifies the user-provided OTP against the stored one in MongoDB.
 */
exports.verifyOTP = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1]
	const { email } = jwt.decode(token)
	const { otp } = req.body
	if (!otp) {
		return res.status(400).json({ message: 'OTP is required.' })
	}

	try {
		// 1. Find the OTP in the database
		const storedOTP = await OTP.findOne({ email, otp })
		if (!storedOTP) {
			// This covers invalid OTP or an expired OTP (due to the TTL index)
			return res.status(401).json({ message: 'Invalid or expired OTP.' })
		}

		// 2. Consume the OTP immediately after successful use
		await OTP.deleteOne({ _id: storedOTP._id })

		const payload = { email }

		// 3. Success and Send JWT token
		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '1d' },
			(err, token) => {
				if (err) throw err
				res.status(201).json({ token, message: 'Verification successful' })
			}
		)
	} catch (error) {
		console.error('Error in verifyOTP:', error)
		res.status(500).json({ error })
	}
}
