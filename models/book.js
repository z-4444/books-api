const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  chapters: [{
    title: { type: String, required: true },
    chapterNo: { type: Number, required: true },
    pages: [{
      pageNo: { type: Number, required: true },
      pageBody: { type: String, required: true }
    }]
  }]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
