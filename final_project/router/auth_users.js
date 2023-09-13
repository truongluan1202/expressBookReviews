const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.username) {
    return res
      .status(401)
      .json({ message: "You must be logged in to delete a review." });
  }

  const bookId = req.params.bookId;
  const reviewText = req.query.review;

  if (books[bookId]) {
    // Check if the book exists
    const book = books[bookId];
    const username = req.session.username;

    book.reviews[username] = reviewText;
    res.status(200).json({ message: "Review added/modified successfully." });
  } else {
    res.status(404).json({ message: "Book not found." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session.username) {
    return res
      .status(401)
      .json({ message: "You must be logged in to delete a review." });
  }

  const isbn = req.params.isbn;
  if (books[isbn]) {
    const book = books[isbn];
    const username = req.session.username;

    if (book.reviews[username]) {
      // User has a review for this ISBN; delete it
      delete book.reviews[username];
      res.status(200).json({ message: "Review deleted successfully." });
    } else {
      // User doesn't have a review for this ISBN
      res.status(404).json({ message: "Review not found." });
    }
  } else {
    // ISBN not found
    res.status(404).json({ message: "Book not found." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
