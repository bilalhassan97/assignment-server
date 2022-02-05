const rfr = require("rfr");
const { sendErrorResponse, sendSuccessResponse } = rfr("/shared/messages"),
  statusCodes = rfr("/shared/statusCode");

const routeNotFound = (req, res) => {
  console.log("Error = > Route Not Found");
  const responseData = {
    message: req.__("GENERAL.ROUTE_NOT_FOUND"),
    flag: statusCodes.NOT_FOUND,
  };
  return sendErrorResponse(responseData, res);
};

const welcome = (req, res) => {
  const responseData = {
    message: req.__("GENERAL.WELCOME"),
  };
  return sendSuccessResponse(responseData, res);
};

const errorHandler = (error, req, res, next) => {
  // console.log("Error ", error);
  console.log("Error Name", error.name);
  switch (error.name) {
    case "MongoServerError": // Or MongoError
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message =
          field.toUpperCase() + " " + req.__("GENERAL.IS_DUPLICATE");
        console.log("MongoServerError = > ", message);
        const responseData = {
          message,
          flag: statusCodes.CONFLICT,
        };
        return sendErrorResponse(responseData, res);
      }
      break;
    default:
      break;
  }

  const STRIPE_ERROR_TYPES = [
    "StripeCardError",
    "StripeRateLimitError",
    "StripeInvalidRequestError",
    "StripeAPIError",
    "StripeConnectionError",
    "StripeAuthenticationError",
  ];

  if (error.type && error.type.includes(STRIPE_ERROR_TYPES)) {
    const errorMessage = error.message + " (" + error.param + ")";
    console.log("Stripe Error = > ", errorMessage);
    const responseData = {
      message: errorMessage,
      flag: error.statusCode,
    };
    return sendErrorResponse(responseData, res);
  }

  if (error.errors && error.errors.email) {
    const responseData = {
      flag: statusCodes.NOT_ACCEPTABLE,
      message: req.__("USER.INVALID_EMAIL"),
    };
    return sendErrorResponse(responseData, res);
  }

  const status = error.status || 500;
  const responseData = {
    message: req.__("GENERAL.SOMETHING_WRONG"),
    flag: status,
  };

  console.log("Unexpeceted Error = > ", error.message);

  return sendErrorResponse(responseData, res);
};

const errorCatcher = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next).catch(next));
  };
};

module.exports = {
  routeNotFound,
  welcome,
  errorHandler,
  errorCatcher,
};
