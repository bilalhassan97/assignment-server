const router = require("express").Router();
const rfr = require("rfr");

const auth = rfr("middlewares/auth");
const savedRestaurantController = rfr(
  "/controllers/savedRestaurant.controller"
);
const { errorCatcher } = rfr("/shared/errors");

router
  .route("/savedRestaurant")
  .post(auth, errorCatcher(savedRestaurantController.createSavedRestaurant))
  .get(auth, errorCatcher(savedRestaurantController.getSavedRestaurants));

router
  .route("/savedRestaurant/:id")
  .delete(auth, errorCatcher(savedRestaurantController.deleteSavedRestaurant));

module.exports = router;
