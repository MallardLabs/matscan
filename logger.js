const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Create the logger
const logger = createLogger({
  level: "info", // Set the default log level
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(), // Add colors to the logs
    logFormat
  ),
  transports: [
    new transports.Console(), // Log to console
  ],
});

// Export the logger instance
module.exports = logger;
