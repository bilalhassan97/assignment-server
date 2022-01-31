const statusCodes = require("./statusCode");
//ERROR MESSAGES

function sendSuccessResponse(data, res) {
  const dataToSend = { ...data };
  if (!dataToSend.flag) {
    dataToSend.flag = statusCodes.OK;
  }

  if (!dataToSend.message) {
    dataToSend.message = statusCodes.getStatusText(statusCodes.OK);
  }

  return res.status(dataToSend.flag).send({
    statusCode: dataToSend.flag,
    message: dataToSend.description || dataToSend.message,
    data: dataToSend.data || {},
  });
}

function sendErrorResponse(error, res) {
  const errorToSend = { ...error };

  if (!errorToSend.flag) {
    errorToSend.flag = statusCodes.METHOD_FAILURE;
  }
  if (!errorToSend.message) {
    errorToSend.message = statusCodes.getStatusText(statusCodes.METHOD_FAILURE);
  }

  const loggerMessage = [errorToSend.flag, errorToSend.message].join(" ");

  // logMessage("debug", loggerMessage);

  return res.status(errorToSend.flag).send(errorToSend);
}

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};
