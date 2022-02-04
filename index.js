const express = require("express"),
  path = require("path"),
  i18n = require("i18n"),
  rfr = require("rfr"),
  dotEnv = require("dotenv");
const {
  logger,
  limiter,
  log_saver,
  helmet,
  compression,
  myCorsPolicy,
} = require("./middlewares");
const { welcome, errorHandler, routeNotFound } = require("./shared/errors");
const rootRouter = require("./routes/index");
const connectDatabase = rfr("/shared/database");

dotEnv.config();

i18n.configure({
  updateFiles: false,
  locales: ["en", "es"],
  directory: __dirname + "/shared/locales",
  logDebugFn: function (msg) {
    console.log("debug", msg);
  },
  logWarnFn: function (msg) {
    console.log("warn", msg);
  },
  logErrorFn: function (msg) {
    console.log("error", msg);
  },
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(i18n.init);
app.use(logger());
app.use(helmet());
app.use(myCorsPolicy());
app.use(compression());
app.use(limiter());
app.use(log_saver());

app.all("/", welcome);
app.use("/api/v1", rootRouter);

app.use(errorHandler);
app.use(routeNotFound);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("Server Running at port: " + port);
  connectDatabase();
});

module.exports = app;
