const { User, validateUser } = require("./user");
const { Restaurant, validateRestaurant } = require("./restaurant");
const { Collection, validateCollection } = require("./collection");
const {
  SavedRestaurant,
  validateSavedRestaurant,
} = require("./savedRestaurant");

module.exports = {
  User,
  validateUser,
  Restaurant,
  validateRestaurant,
  Collection,
  validateCollection,
  SavedRestaurant,
  validateSavedRestaurant,
};
