const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error({ error: "Invalid Email address" });
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "User",
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.authenticate = async (email, password) => {
  const user = await User.findOne({ email }, { password: 1, email: 1 });
  if (!user) {
    return { fail: true, error: "Invalid login credentials" };
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return { fail: true, error: "Invalid login credentials" };
  }
  return user;
};

const validateUser = (user) => {
  const schema = Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().max(100),
    surname: Joi.string().required().max(100),
    password: Joi.string().required().min(6).max(100),
  });
  return schema.validate(user);
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  validateUser,
};
