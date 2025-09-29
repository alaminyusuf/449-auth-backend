const crypto = require('crypto')
const nodemailer = require('nodemailer')

// Utility to send email (needs configuration)
const sendEmail = (options) => {
	// 1. Create a transporter object (e.g., using Gmail, SendGrid, etc.)
	const transporter = nodemailer.createTransport({
		service: 'Gmail', // Example
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	// 2. Define email options
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: options.to,
		subject: options.subject,
		html: options.html, // Use HTML for the email body
	}

	// 3. Send the email
	transporter.sendMail(mailOptions)
}

// @route POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
	const { email } = req.body
	try {
		const user = await User.findOne({ email })

		if (!user) {
			return res
				.status(404)
				.json({ msg: 'User with that email does not exist.' })
		}

		// Generate reset token (e.g., 32 random bytes, converted to hex)
		const resetToken = crypto.randomBytes(32).toString('hex')

		// Save the hashed token to the database and set expiration (e.g., 1 hour)
		user.resetPasswordToken = crypto
			.createHash('sha256')
			.update(resetToken)
			.digest('hex')
		user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour
		await user.save()

		// Create the reset URL for the email
		const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

		const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link is only valid for 1 hour.</p>
        `

		await sendEmail({
			to: user.email,
			subject: 'Password Reset Request',
			html: message,
		})

		res.json({ msg: 'Password reset link sent to email.' })
	} catch (err) {
		// Clear token if email sending fails to prevent a security vulnerability
		// ... (Error handling omitted for brevity)
		res.status(500).send('Server error. Could not send email.')
	}
}

// @route PUT /api/auth/resetpassword/:resetToken
exports.resetPassword = async (req, res) => {
	const resetToken = req.params.resetToken
	const { newPassword } = req.body

	// Hash the token received from the client for database lookup
	const hashedToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex')

	try {
		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
		})

		if (!user) {
			return res
				.status(400)
				.json({ msg: 'Invalid or expired password reset token.' })
		}

		// Hash the new password and update the user
		const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(newPassword, salt)

		// Clear the reset fields
		user.resetPasswordToken = undefined
		user.resetPasswordExpires = undefined

		await user.save()

		res.json({ msg: 'Password successfully reset.' })
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server error')
	}
}
