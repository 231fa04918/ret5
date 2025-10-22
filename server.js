const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "books.json");

app.use(express.json());

// Helper: read JSON file safely
function readBooks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading books.json:", err);
    return [];
  }
}

// Helper: write JSON file safely
function writeBooks(books) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
  } catch (err) {
    console.error("Error writing books.json:", err);
  }
}

/* ------------------ ROUTES ------------------ */

// GET /books → return all books
app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});

// BONUS: GET /books/available → return available books
app.get("/books/available", (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(b => b.available === true);
  res.json(availableBooks);
});

// POST /books → add new book with auto-increment id
app.post("/books", (req, res) => {
  const { title, author, available } = req.body;

  if (!title || !author || typeof available !== "boolean") {
    return res.status(400).json({ error: "Invalid book data" });
  }

  const books = readBooks();
  const newId = books.length > 0 ? books[books.length - 1].id + 1 : 1;

  const newBook = { id: newId, title, author, available };
  books.push(newBook);
  writeBooks(books);

  res.status(201).json(newBook);
});

// PUT /books/:id → update book details
app.put("/books/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const { title, author, available } = req.body;

  const books = readBooks();
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (title !== undefined) books[bookIndex].title = title;
  if (author !== undefined) books[bookIndex].author = author;
  if (available !== undefined) books[bookIndex].available = available;

  writeBooks(books);
  res.json(books[bookIndex]);
});

// DELETE /books/:id → delete a book
app.delete("/books/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  const books = readBooks();

  const updatedBooks = books.filter(b => b.id !== bookId);

  if (updatedBooks.length === books.length) {
    return res.status(404).json({ error: "Book not found" });
  }

  writeBooks(updatedBooks);
  res.json({ message: "Book deleted successfully" });
});

/* -------------------------------------------- */

app.listen(PORT, () => {
  console.log(`📚 Server running on http://localhost:${PORT}`);
});
