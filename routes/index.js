const authRoutes = require("./auth.route");
const restaurantRoutes = require("./restaurant.route");

module.exports = [].concat(authRoutes, restaurantRoutes);
