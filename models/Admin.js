const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const AdminUserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, default: 'admin' }, // Enforce 'admin' role
})

module.exports = mongoose.model('Admin', AdminUserSchema)
