const Employee = require('../models/Employee')
const PaymentRecord = require('../models/Payment')
const Income = require('../models/Income')

const calculateNetPay = (employee) => {
	// Basic calculation: Gross Pay = Base Salary + Allowances
	const grossPay = employee.baseSalary
	return { grossPay }
}

// POST /api/admin/pay-salaries
// Triggers the simulated salary payment for all employees
exports.paySalaries = async (req, res) => {
	try {
		// You would typically get the cycle (e.g., 'Oct 2025') from req.body
		const paymentCycle =
			req.body.cycle ||
			new Date().toLocaleString('default', {
				month: 'short',
				year: 'numeric',
			})

		// 1. Fetch all employees
		const employees = await Employee.find({})

		const paymentResults = []

		for (const employee of employees) {
			// 2. Check if this employee has already been paid for this cycle
			const alreadyPaid = await PaymentRecord.findOne({
				employee: employee._id,
				paymentCycle: paymentCycle,
			})

			if (alreadyPaid) {
				paymentResults.push({
					employee: employee.name,
					status: 'SKIPPED',
					message: 'Already paid for this cycle.',
				})
				continue
			}

			// 3. Calculate the salary details
			const { grossPay } = calculateNetPay(employee)

			// 4. MOCK PAYMENT SUCCESS: Create a new payment record in the database
			const newPayment = new PaymentRecord({
				employee: employee._id,
				grossPay,
				paymentCycle,
				status: 'RECORDED', // Confirms the payment ledger entry
			})

			await newPayment.save()

			const incomeSource = `Salary Payment for ${paymentCycle}`

			const newIncome = new Income({
				user: employee._id,
				amount: grossPay,
				description: incomeSource,
			})

			await newIncome.save()

			paymentResults.push({
				employee: employee.name,
				grossPay,
				status: 'SUCCESS',
			})
		}

		res.status(200).json({
			message: `Payroll processing completed for cycle ${paymentCycle}.`,
			summary: paymentResults,
		})
	} catch (error) {
		console.log(error)
		res
			.status(500)
			.json({ message: 'Error processing payroll.', error: error.message })
	}
}

// GET /api/admin/payroll-history
// View all past payment records
exports.viewPayHistory = async (req, res) => {
	try {
		const history = await PaymentRecord.find({})
			.populate('employee', 'name email baseSalary') // Join with employee data
			.sort({ paymentDate: -1 })

		res.status(200).json(history)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching payroll history.' })
	}
}
