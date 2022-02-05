const authRoutes = require("./auth.route");
const restaurantRoutes = require("./restaurant.route");
const collectionRoutes = require("./collection.route");
const savedRestaurantRoutes = require("./savedRestaurant.route");

module.exports = [].concat(
  authRoutes,
  restaurantRoutes,
  collectionRoutes,
  savedRestaurantRoutes
);
