const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMs
  message: "Too many login attempts from this IP. Please try again later.",
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: options.message, // To get the message at the right place to display it on the client side.
    });
  },
});

// Exports the rate limiting middleware so it can be used in other parts of your application.
module.exports = { loginLimiter };
