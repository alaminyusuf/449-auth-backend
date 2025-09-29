// routes/authRoutes.js (using Express router)
const express = require('express')
const router = express.Router()
const authController = require('./auth')
const passwordController = require('../controllers/password')
const otpController = require('../controllers/opt')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/send-otp', otpController.sendOTPEmail)
router.post('/verify-otp', otpController.verifyOTP)
router.post('/forgot-password', passwordController.forgotPassword)
router.post('/reset-password', passwordController.resetPassword)

module.exports = router
