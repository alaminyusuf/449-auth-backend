const mongoose = require('mongoose')

/**
 * Connects to the MongoDB database.
 */
const connectDB = async () => {
	try {
		mongoose.connect(process.env.MONGO_URI)
		const connection = mongoose.connection

		connection.on('connected', () => {
			console.log('Great! MongoDb is connected bro!')
		})

		connection.on('error', (err) => {
			console.log('MongoDB connected ERROR. ' + err)
			process.exit()
		})
	} catch (error) {
		console.log('Ups! Something went wrong! ' + error)
	}
}

module.exports = connectDB
