// controllers/otpController.js
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const OTP = require('../models/OTP')
const User = require('../models/User')

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

// ---------------------------------------------------------------------
// 1. Initiate Password Reset (Send OTP)
// ---------------------------------------------------------------------

exports.forgotPassword = async (req, res) => {
	const { email } = req.body
	if (!email) {
		return res.status(400).json({ message: 'Email is required.' })
	}

	try {
		// 1. Check if user exists
		const user = await User.findOne({ email })
		if (!user) {
			// Send a success message even if the user doesn't exist to prevent enumeration
			return res.status(202).json({
				message: 'Email not found',
			})
		}

		const otp = generateOTP(6)

		// 2. Delete any existing OTP for this email and save the new one
		await OTP.deleteMany({ email })
		const newOTP = new OTP({ email, otp })
		await newOTP.save()

		// 3. Email content
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Password Reset Code',
			html: `<p>Your password reset code is: <strong>${otp}</strong>. It expires in 10 minutes. Enter this code into your mobile app to proceed.</p>`,
		}

		// 4. Send the email
		await transporter.sendMail(mailOptions)

		const payload = { email }

		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '10m' },
			(err, token) => {
				if (err) throw err
				return res.status(201).json({
					token,
					message: 'Password reset code sent to your email',
				})
			}
		)
	} catch (error) {
		res.status(500).json({
			message: 'Failed to initiate password reset.',
			error: error.message,
		})
	}
}

// ---------------------------------------------------------------------
// 2. Finalize Password Reset (Verify OTP and Update Password)
// ---------------------------------------------------------------------

exports.resetPassword = async (req, res) => {
	const { otp, newPassword, email } = req.body
	if (!otp || !newPassword) {
		return res
			.status(400)
			.json({ message: 'Email, OTP, and new password are required.' })
	}

	try {
		// 1. Find and consume the OTP in the database
		const storedOTP = await OTP.findOne({ email, otp })

		if (!storedOTP) {
			// Covers invalid OTP or expired OTP (due to the TTL index)
			return res
				.status(401)
				.json({ message: 'Invalid or expired reset code.' })
		}

		// 2. Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// 3. Update the user's password
		const userUpdateResult = await User.updateOne(
			{ email },
			{ $set: { password: hashedPassword } }
		)

		if (userUpdateResult.modifiedCount === 0) {
			// This case should ideally not happen if step 1 passed, but it's a safety check
			return res
				.status(404)
				.json({ message: 'User not found or password not modified.' })
		}

		// 4. Invalidate (delete) the OTP after successful use
		await OTP.deleteOne({ _id: storedOTP._id })

		// 5. Success
		res.status(200).json({
			message:
				'Password has been successfully reset. Please proceed to login.',
		})
	} catch (error) {
		console.error('Error in resetPassword:', error)
		res
			.status(500)
			.json({ message: 'Internal server error during password reset.' })
	}
}
