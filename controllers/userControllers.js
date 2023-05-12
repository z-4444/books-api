const User = require("../models/user");
const Book = require("../models/book")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { name, email, userType, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, userType });
    await user.save();

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );

    res.status(201).send({ user, token });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );

    res.status(200).send({ user, token });
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();
    return res.send({
      message: `User ${
        user.status === "active" ? "unblocked" : "blocked"
      } successfully`,
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

exports.buyBook = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const book = await Book.findById(req.params.bookId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }

    if (user.status === "blocked") {
      return res.status(403).send({ message: "User is blocked" });
    }

    if (user.purchasedBooks.includes(book._id)) {
      return res
        .status(409)
        .send({ message: "User has already purchased this book" });
    }

    user.purchasedBooks.push(book._id);
    await user.save();

    return res.send({ message: "Book purchased successfully" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
