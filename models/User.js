const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	// 2FA Fields
	isTwoFactorEnabled: {
		type: Boolean,
		default: false,
	},
	twoFactorSecret: {
		type: String,
		default: null,
	},
	// Password Reset Fields
	resetPasswordToken: {
		type: String,
		default: null,
	},
	resetPasswordExpires: {
		type: Date,
		default: null,
	},
})

module.exports = mongoose.model('User', UserSchema)
