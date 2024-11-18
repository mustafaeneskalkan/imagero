// logger.js
const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'silly', // Log everything in development
  format: winston.format.combine(
    winston.format.colorize(), // Add color to the output
    winston.format.timestamp({
      format: () => {
        const now = new Date();
        now.setHours(now.getHours()); // Adjust as needed

        // Get hours, minutes, seconds, and milliseconds
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        // Return formatted string as HH:mm:ss.SSS
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
      }
    }), // Add timestamp  format: 'HH:mm:ss'
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`; // Custom log format
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
  ],
});

// Export the logger
module.exports = logger;
