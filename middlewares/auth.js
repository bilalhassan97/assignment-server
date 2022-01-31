const rfr = require("rfr");

const { decodeToken } = rfr("/shared/utils"),
  statusCodes = rfr("/shared/statusCode"),
  { sendErrorResponse } = rfr("/shared/messages");

module.exports = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    const responseData = {
      flag: statusCodes.UNAUTHORIZED,
      message: statusCodes.getStatusText(statusCodes.UNAUTHORIZED),
    };

    if (!token) {
      return sendErrorResponse(responseData, res);
    }

    token = token.replace("Bearer ", "");
    const decoded = await decodeToken(token);

    req.authUser = decoded;
    next();
  } catch (error) {
    return sendErrorResponse(
      {
        flag: statusCodes.UNAUTHORIZED,
        message: statusCodes.getStatusText(statusCodes.UNAUTHORIZED),
      },
      res
    );
  }
};
