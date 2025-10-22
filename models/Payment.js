const mongoose = require('mongoose')

const PaymentRecordSchema = new mongoose.Schema({
	employee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee',
		required: true,
	},
	grossPay: { type: Number, required: true },
	paymentDate: { type: Date, default: Date.now },
	paymentCycle: { type: String, required: true },
	status: { type: String, default: 'RECORDED' },
})

module.exports = mongoose.model('PaymentRecord', PaymentRecordSchema)
