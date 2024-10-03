const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (token !== "" && token) {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      const validUser = await User.findById(userId);
      if (validUser) {
        req.user = userId;
        next(); // Proceed to the next middleware or route handler
      } else {
        return res
          .status(400)
          .json({ msg: "User not found! You need to log in first" });
      }
    } else {
      return res
        .status(400)
        .json({ msg: "No token provided! You need to log in first" });
    }
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error", error: err });
  }
};

module.exports = isLoggedIn;
