// routes/authRoutes.js (using Express router)
const express = require('express')
const router = express.Router()
const authController = require('./auth')
const otpController = require('../controllers/opt')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/send-otp', otpController.sendOTPEmail)
router.post('/verify-otp', otpController.verifyOTP)

module.exports = router
