const rfr = require("rfr");

const { User, validateUser } = rfr("/models"),
  statusCodes = rfr("/shared/statusCode"),
  { generateToken } = rfr("/shared/utils"),
  { sendErrorResponse, sendSuccessResponse } = rfr("/shared/messages");

exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let user = await User.authenticate(email, password);

  if (!user || user.fail) {
    const responseData = {
      message: !user ? "error" : user.error,
      data: {},
    };

    return sendErrorResponse(responseData, res);
  }
  const tokenData = {
    _id: user._id,
    email: user.email,
  };

  const token = await generateToken(tokenData);

  const responseData = {
    message: req.__("USER.LOGIN_SUCCESS"),
    data: {
      _id: user._id,
      accessToken: token,
    },
  };
  sendSuccessResponse(responseData, res);
};

exports.userSignup = async (req, res, next) => {
  const { name, surname, email, password } = req.body;

  const { error } = validateUser(req.body);

  if (error) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_INPUT"),
    };
    return sendErrorResponse(responseData, res);
  }

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    const responseData = {
      flag: statusCodes.NOT_ACCEPTABLE,
      message: req.__("GENERAL.EMAIL_EXISTS"),
    };

    return sendErrorResponse(responseData, res);
  }

  const user = new User({
    name,
    surname,
    email,
    password,
  });

  const result = await user.save();

  const tokenData = {
    _id: result._id,
    email: result.email,
  };

  const token = await generateToken(tokenData);

  const responseData = {
    message: req.__("USER.SIGNUP_SUCCESS"),
    data: { _id: result._id, accessToken: token },
  };

  sendSuccessResponse(responseData, res);
};
