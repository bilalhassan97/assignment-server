const router = require("express").Router();
const rfr = require("rfr");

const restaurantController = rfr("/controllers/restaurant.controller");
const { errorCatcher } = rfr("/shared/errors");

router
  .route("/restaurant")
  .post(errorCatcher(restaurantController.createRestaurant))
  .get(errorCatcher(restaurantController.getRestaurants));

module.exports = router;
