const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const auth = require("./middlewares/auth");
const isAdmin = require("./middlewares/isAdmin");
const connect = require("./helpers/conectDB");
const bookControllers = require("./controllers/bookControllers");
const userControllers = require("./controllers/userControllers");
const stripe = require("stripe");
(process.env.STRIPE_SECRET_KEY);

const app = express();

connect();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/users/register", userControllers.register);

app.post("/users/login", userControllers.login);

app.put("/users/:id/status", auth, isAdmin, userControllers.updateStatus);

app.post("/users/:userId/purchase/:bookId", auth, userControllers.buyBook);

app.get("/books", bookControllers.allBooks);

app.get("/books/:id", bookControllers.bookById);

app.post("/books", auth, isAdmin, bookControllers.createBook);

app.put("/books/:id", auth, isAdmin, bookControllers.updateBook);

app.delete("/books/:id", auth, isAdmin, bookControllers.deleteBook);

app.get("/sales", auth, isAdmin, bookControllers.sales);

app.listen(3001, () => {
  console.log("Server started on port 3001");
});
