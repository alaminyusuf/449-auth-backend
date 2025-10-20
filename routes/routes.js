// routes/authRoutes.js (using Express router)
const express = require('express')
const router = express.Router()
const authController = require('./auth')
const passwordController = require('../controllers/password')
const otpController = require('../controllers/opt')
const { protect, admin } = require('../middleware/auth')
const staffController = require('../controllers/staff')
const adminController = require('../controllers/admin')

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/send-otp', protect, otpController.sendOTPEmail)
router.post('/verify-otp', protect, otpController.verifyOTP)
router.post('/forgot-password', passwordController.forgotPassword)
router.post('/reset-password', protect, passwordController.resetPassword)
router.post('/staff/add-income', protect, staffController.addIncome)
router.post('/staff/add-expense', protect, staffController.addExpense)
router.get('/staff/get-summary', protect, staffController.getSummary)
router.get(
	'/staff/get-transactions',
	protect,
	staffController.getTransactions
)
router.get(
	'/admin/view-pay-history',
	protect,
	admin,
	adminController.viewPayHistory
)
router.post(
	'/admin/pay-salaries',
	protect,
	admin,
	adminController.paySalaries
)
router.post(
	'/admin/add-employee',
	protect,
	admin,
	authController.addEmployee
)

module.exports = router
