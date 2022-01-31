const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

morgan.token("date", () => {
  return new Date().toISOString();
});
const logger = () => {
  return morgan("dev");
};

const log_saver = () => {
  return morgan(":method :status ( :url ) ( :date ) :response-time ms", {
    stream: fs.createWriteStream(
      path.join(__dirname, "./../shared/logs/access.log"),
      {
        flags: "a",
      }
    ),
  });
};
module.exports = { logger, log_saver };
