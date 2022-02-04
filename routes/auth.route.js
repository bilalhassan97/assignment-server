const router = require("express").Router();
const rfr = require("rfr");

const authController = rfr("/controllers/auth.controller");
const { errorCatcher } = rfr("/shared/errors");

router.route("/auth/signup").post(errorCatcher(authController.userSignup));

router.route("/auth/login").post(errorCatcher(authController.userLogin));

module.exports = router;
