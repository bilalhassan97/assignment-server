const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const collectionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    collection: "Collection",
  }
);

const validateCollection = (collection) => {
  const schema = Joi.object().keys({
    title: Joi.string().required().max(100),
    user: Joi.string().required(),
  });
  return schema.validate(collection);
};

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = {
  Collection,
  validateCollection,
};
