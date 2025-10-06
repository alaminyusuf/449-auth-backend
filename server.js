const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const apiRoutes = require('./routes/routes')

dotenv.config('./')
connectDB()
const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiRoutes)
app.use('/.netlify/functions/api', router)

module.exports = app
