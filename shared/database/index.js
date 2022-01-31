const mongoose = require("mongoose");

const connectDatabase = async (callback = (con, err) => {}) => {
  await mongoose
    .connect(process.env.MONGODB_URI, { ignoreUndefined: true })
    .then((con) => {
      console.log(`DB HAS BEEN CONNECTED!`);
      callback(con, null);
    })
    .catch((err) => {
      console.log(`DB CONNECTION ERROR: ${err}`);
      callback(null, err);
    });
};

module.exports = connectDatabase;
