// server/config/logger.js
const winston = require('winston')

// Define custom colors for log levels (optional)
const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
}
winston.addColors(colors)

// Define the format for log messages
const logFormat = winston.format.combine(
	// Determine if we are logging to file or console
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`
	)
)

// Create the logger instance
const logger = winston.createLogger({
	level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
	format: logFormat,
	transports: [
		// 1. Console Transport (Always log to console in development)
		new winston.transports.Console({
			level: 'debug', // Show everything in the console during development
			format: winston.format.combine(
				winston.format.colorize({ all: true }),
				logFormat
			),
		}),

		// 2. File Transport (Log errors and general info to files)
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error', // Only log messages with level 'error' and above
			format: winston.format.uncolorize(), // Don't save colors to file
		}),

		new winston.transports.File({
			filename: 'logs/combined.log',
			level: 'info', // Log messages with level 'info' and above
			format: winston.format.uncolorize(),
		}),
	],
	// Exit application if unhandled exception occurs (recommended for server stability)
	exceptionHandlers: [
		new winston.transports.File({ filename: 'logs/exceptions.log' }),
	],
})

module.exports = logger
