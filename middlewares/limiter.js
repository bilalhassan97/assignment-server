const rateLimit = require("express-rate-limit");

const limiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests, please try again after an hour",
  });
};

module.exports = { limiter };
