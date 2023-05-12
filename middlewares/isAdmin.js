const User = require("../models/user");
const jwt = require('jsonwebtoken');
const isAdmin = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({
    _id: decoded._id,
  });
  
  if (user?.userType === "admin") {
    next();
  } else {
    res.status(403).send({ message: "Forbidden" });
  }
};

module.exports = isAdmin;
