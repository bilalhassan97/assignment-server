const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          required: true,
        },
        startHours: { type: Number, required: true },
        startMinutes: { type: Number, required: true },
        endHours: { type: Number, required: true },
        endMinutes: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
    collection: "Restaurant",
  }
);

const validateRestaurant = (restaurant) => {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    schedule: Joi.array().items(
      Joi.object().keys({
        day: Joi.string().required(),
        startHours: Joi.number().required(),
        startMinutes: Joi.number().required(),
        endHours: Joi.number().required(),
        endMinutes: Joi.number().required(),
      })
    ),
  });
  return schema.validate(restaurant);
};

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = {
  Restaurant,
  validateRestaurant,
};
