const JWT = require("jsonwebtoken");
/**
 * Generate JWT token
 * @param {object} tokenData Data to be encrypted in token
 */
async function generateToken(tokenData) {
  const secret = process.env.JWT_SECRET;
  try {
    const token = JWT.sign(tokenData, secret);
    return token;
  } catch (err) {
    return err;
  }
}

const decodeToken = async (token) => {
  const secret = process.env.JWT_SECRET;
  const decoded = await JWT.verify(token, secret);
  return decoded;
};

module.exports = {
  generateToken,
  decodeToken,
};
