const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, "books.json");

function readBooks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeBooks(books) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
}

app.get("/api/books", (req, res) => res.json(readBooks()));

app.get("/api/books/available", (req, res) =>
  res.json(readBooks().filter((b) => b.available))
);

app.post("/api/books", (req, res) => {
  const { title, author, available } = req.body;
  if (!title || !author || typeof available !== "boolean")
    return res.status(400).json({ error: "Invalid book data" });

  const books = readBooks();
  const newId = books.length ? books[books.length - 1].id + 1 : 1;
  const newBook = { id: newId, title, author, available };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

app.put("/api/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, available } = req.body;
  const books = readBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  if (title !== undefined) books[index].title = title;
  if (author !== undefined) books[index].author = author;
  if (available !== undefined) books[index].available = available;
  writeBooks(books);
  res.json(books[index]);
});

app.delete("/api/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const books = readBooks();
  const filtered = books.filter((b) => b.id !== id);
  if (filtered.length === books.length)
    return res.status(404).json({ error: "Book not found" });
  writeBooks(filtered);
  res.json({ message: "Book deleted successfully" });
});

module.exports = app;
