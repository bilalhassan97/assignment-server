const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const savedRestaurantSchema = new Schema(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "SavedRestaurant",
  }
);

const validateSavedRestaurant = (savedRestaurant) => {
  const schema = Joi.object().keys({
    collectionId: Joi.string().required(),
    restaurantId: Joi.string().required(),
  });
  return schema.validate(savedRestaurant);
};

const SavedRestaurant = mongoose.model(
  "SavedRestaurant",
  savedRestaurantSchema
);

module.exports = {
  SavedRestaurant,
  validateSavedRestaurant,
};
