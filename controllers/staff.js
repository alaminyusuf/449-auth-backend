const jwt = require('jsonwebtoken')
const User = require('../models/Employee')
const Income = require('../models/Income')
const Expense = require('../models/Expense')

exports.addIncome = async (req, res) => {
	let token = req.headers.authorization?.split(' ')[1]
	const decoded = jwt.verify(token, process.env.JWT_SECRET)
	const user = await User.findOne({ email: decoded.email }).select(
		'-password'
	)
	try {
		const { amount, source } = req.body
		const income = new Income({ user: user._id, amount, source })
		await income.save()
		res.json({ message: 'Income added' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: error })
	}
}

exports.addExpense = async (req, res) => {
	let token = req.headers.authorization?.split(' ')[1]
	const decoded = jwt.verify(token, process.env.JWT_SECRET)
	const user = await User.findOne({ email: decoded.email }).select(
		'-password'
	)
	try {
		const { amount, description } = req.body
		const expense = new Expense({
			user: user._id,
			amount,
			description,
		})
		await expense.save()
		res.json({ message: 'Expense added' })
	} catch (error) {
		res.status(500).json({ message: 'Server error' })
	}
}

exports.getSummary = async (req, res) => {
	// 1. Authentication and User Retrieval (Same as other functions)
	let token = req.headers.authorization?.split(' ')[1]
	let decoded
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET)
	} catch (error) {
		return res
			.status(401)
			.json({ message: 'Not authorized, token failed' })
	}

	const user = await User.findOne({ email: decoded.email }).select(
		'_id' // Only need the ID for querying
	)

	if (!user) {
		return res.status(404).json({ message: 'User not found' })
	}

	try {
		const userId = user._id

		// 2. Aggregate Total Income
		const totalIncomeResult = await Income.aggregate([
			// Filter documents by the authenticated user's ID
			{ $match: { user: userId } },
			// Group all matching documents and sum the 'amount' field
			{
				$group: {
					_id: null,
					total: { $sum: '$amount' },
				},
			},
		])

		// Extract the total income, defaulting to 0 if no records found
		const totalIncome =
			totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0

		// 3. Aggregate Total Expenses
		const totalExpenseResult = await Expense.aggregate([
			// Filter documents by the authenticated user's ID
			{ $match: { user: userId } },
			// Group all matching documents and sum the 'amount' field
			{
				$group: {
					_id: null,
					total: { $sum: '$amount' },
				},
			},
		])

		// Extract the total expenses, defaulting to 0 if no records found
		const totalExpenses =
			totalExpenseResult.length > 0 ? totalExpenseResult[0].total : 0

		// 4. Send the calculated summary
		res.status(200).json({ totalIncome, totalExpenses })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

exports.getTransactions = async (req, res) => {
	// 1. Authentication and User Retrieval
	let token = req.headers.authorization?.split(' ')[1]
	let decoded

	if (!token) {
		return res
			.status(401)
			.json({ message: 'Not authorized, no token provided' })
	}

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET)
	} catch (error) {
		return res
			.status(401)
			.json({ message: 'Not authorized, token failed or expired' })
	}

	try {
		// Find the user to get their ID, which is crucial for filtering
		const user = await User.findOne({ email: decoded.email }).select('_id')

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const userId = user._id

		// 2. Fetch all Income transactions for the user
		// We sort by createdAt descending to show latest first, which is useful for lists
		const income = await Income.find({ user: userId }).sort({
			createdAt: -1,
		})

		// 3. Fetch all Expense transactions for the user
		const expenses = await Expense.find({ user: userId }).sort({
			createdAt: -1,
		})

		// 4. Send the combined data back to the client
		// The client-side logic will combine and display this data
		res.status(200).json({ income, expenses })
	} catch (error) {
		console.error('Error fetching user transactions:', error)
		res.status(500).json({ message: 'Server error fetching transactions' })
	}
}
