// income model
const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	amount: { type: Number, required: true },
	description: { type: String },
	createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Income', incomeSchema)
