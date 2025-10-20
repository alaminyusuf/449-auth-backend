const mongoose = require('mongoose')

const PaymentRecordSchema = new mongoose.Schema({
	employee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee',
		required: true,
	},
	grossPay: { type: Number, required: true },
	deductions: { type: Number, required: true },
	netPay: { type: Number, required: true }, // The final amount "paid"
	paymentDate: { type: Date, default: Date.now },
	paymentCycle: { type: String, required: true }, // e.g., "Oct 2025"
	// Mock status to indicate payment was "processed" in the system
	status: { type: String, default: 'RECORDED' },
})

module.exports = mongoose.model('PaymentRecord', PaymentRecordSchema)
