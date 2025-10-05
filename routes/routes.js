// routes/authRoutes.js (using Express router)
const express = require('express')
const router = express.Router()
const authController = require('./auth')
const passwordController = require('../controllers/password')
const otpController = require('../controllers/opt')
const protected = require('../middleware/auth')

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/send-otp', protected, otpController.sendOTPEmail)
router.post('/verify-otp', protected, otpController.verifyOTP)
router.post('/forgot-password', passwordController.forgotPassword)
router.post('/reset-password', protected, passwordController.resetPassword)

module.exports = router
