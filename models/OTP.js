// models/OTP.js
const mongoose = require('mongoose')

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		// Automatically delete the document after 10 minutes (600 seconds)
		// MongoDB handles this TTL index automatically.
		expires: 60 * 10, // 600 seconds = 10 minutes
	},
})

module.exports = mongoose.model('OTP', OTPSchema)
