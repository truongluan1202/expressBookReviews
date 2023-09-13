const express = require("express");
// let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const fs = require("fs").promises;
const path = require("path");

function getBooks() {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the file path to booksdb.js in the same directory as general.js
      let books = require("./booksdb.js");
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooks()
    .then((books) => {
      res.send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      console.error("Error reading booksdb.js:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  getBooks()
    .then((books) => {
      res.send(books[isbn]);
    })
    .catch((error) => {
      console.error("Error reading booksdb.js:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const filteredBooks = [];
  getBooks()
    .then((books) => {
      for (i in books) {
        if (books[i].author === author) filteredBooks.push(books[i]);
      }
      res.send(filteredBooks);
    })
    .catch((error) => {
      console.error("Error reading booksdb.js:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const filteredBooks = [];
  getBooks()
    .then((books) => {
      for (i in books) {
        if (books[i].title === title) filteredBooks.push(books[i]);
      }
      res.send(filteredBooks);
    })
    .catch((error) => {
      console.error("Error reading booksdb.js:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  getBooks()
    .then((books) => {
      res.send(books[isbn].review);
    })
    .catch((error) => {
      console.error("Error reading booksdb.js:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports.general = public_users;
