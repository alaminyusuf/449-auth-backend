const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') // New dependency

const EmployeeSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true }, // NEW FIELD
	role: { type: String, default: 'staff' }, // NEW FIELD (different from admin)
	baseSalary: { type: Number, required: true },
	paymentAccount: { type: String, required: true },
})

// Middleware to hash the password before saving (same as AdminUser)
EmployeeSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		const salt = await bcrypt.genSalt(10)
		this.password = await bcrypt.hash(this.password, salt)
	}
	next()
})

// Method to compare entered password with hashed password (same as AdminUser)
EmployeeSchema.methods.comparePassword = function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('Employee', EmployeeSchema)
