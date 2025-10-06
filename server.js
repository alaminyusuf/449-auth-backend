const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const logger = require('./config/logger')
const connectDB = require('./config/db')
const apiRoutes = require('./routes/routes')

dotenv.config('./')
connectDB()
const app = express()
app.use(cors())
app.use((req, res, next) => {
	// Log the request method and URL
	logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`)
	next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiRoutes)

app.get('/', (req, res) => {
	res.status(200).send('<h1>Hello World</h1>')
})

app.listen(8080, (err) => {
	if (err) throw err
	console.log('Server Running on PORT 8080')
})

// module.exports = app
