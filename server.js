const express = require('express')
const connectDB = require('./config/db')
const apiRoutes = require('./routes/routes')

connectDB()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiRoutes)
app.listen(5000, (err) => {
	if (err) throw err
	console.log('Server listening on port 5000')
})
