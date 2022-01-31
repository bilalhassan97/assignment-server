const cors = require("cors");

const whiteList = ["http://localhost:3000", "http://localhost:3001"];

const corsOptions = {
  // origin: whiteList,
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  preflightContinue: true,
  optionsSuccessStatus: 200,
};

const myCorsPolicy = () => cors(corsOptions);

module.exports = { myCorsPolicy };
