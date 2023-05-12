const Book = require("../models/book");

exports.allBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.send(books);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.bookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }
    return res.send(book);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = new Book({
      title: req.body?.title,
      author: req.body?.author,
      price: req.body?.price,
      chapters: [
        {
          title: req.body?.chapters[0]?.title,
          chapterNo: req.body?.chapters[0]?.chapterNo,
          pages: [
            {
              pageNo: req.body?.chapters[0]?.pages[0]?.pageNo,
              pageBody: req.body.chapters[0]?.pages[0]?.pageBody,
            },
          ],
        },
      ],
    });
    await book.save();
    return res.send({ message: "Book added successfully" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

exports.updateBook = async (req, res) => {
  const { title, author, price, chapters } = req.body;
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        price,
        chapters,
      },
      { new: true }
    );
    if (!updatedBook) {
      return res.status(404).send({ message: "Book not found" });
    }
    return res.send({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }
    return res.send({ message: "Book deleted successfully" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

exports.sales = async (req, res) => {
  const { bookId, period } = req.query;

  // Check if book ID is provided and valid
  const match = {};
  if (bookId) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).send({ message: "Invalid book ID" });
    }
    match.book = mongoose.Types.ObjectId(bookId);
  }

  // Set time period filter
  let startDate;
  switch (period) {
    case "weekly":
      startDate = moment().subtract(1, "week").startOf("day").toDate();
      break;
    case "monthly":
      startDate = moment().subtract(1, "month").startOf("day").toDate();
      break;
    case "daily":
    default:
      startDate = moment().startOf("day").toDate();
  }
  match.date = { $gte: startDate };

  try {
    // Aggregate sales data
    const salesData = await Book.aggregate([
      { $match: match },
      { $group: { _id: "$book", totalSales: { $sum: "$quantity" } } },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $project: {
          _id: 0,
          book: "$_id",
          totalSales: 1,
          bookDetails: { $arrayElemAt: ["$bookDetails", 0] },
        },
      },
    ]);

    return res.send({ sales: salesData });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
