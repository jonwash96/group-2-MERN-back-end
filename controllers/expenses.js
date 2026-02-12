const router = require("express").Router();
const Expense = require("../models/Expense");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/User");
const mongoose = require("mongoose");
// THIS LINE OF CODE SERVES ONE PURPOSE. MAN OVER MACHINE RE: GIT LOG/PUSH

// all expense routes require auth
router.use(requireAuth);

// helpers
function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function parseMonthOrRange(req) {
  // supports: ?month=YYYY-MM or ?start=YYYY-MM-DD&end=YYYY-MM-DD
  const { month, start, end } = req.query;

  if (month) {
    const baseDate = new Date(`${month}-01T00:00:00.000Z`);
    return getMonthRange(baseDate);
  }

  if (start && end) {
    return { start: new Date(start), end: new Date(end) };
  }

  return { start: null, end: null };
}

// GET /expenses (index)
router.get("/", async (req, res) => {
  try {
    const { start, end } = parseMonthOrRange(req);

    const filter = { user: req.user._id, isDeleted: false };
    if (start && end) filter.date = { $gte: start, $lt: end };

    console.log("@get expenses", req.user);
    const expenses = await Expense.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET /expenses/by-category?month=YYYY-MM
router.get("/by-category", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { start, end } = parseMonthOrRange(req);

    const match = { user: userId, isDeleted: false };
    if (start && end) match.date = { $gte: start, $lt: end };

    const categories = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $project: { _id: 0, category: "$_id", total: 1, count: 1 } },
    ]);

    res.json({ range: start && end ? { start, end } : null, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET /expenses/:expenseId (show)
router.get("/:expenseId", async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      user: req.user._id,
      isDeleted: false,
    });
    // .populate("merchant");

    if (!expense)
      return res.status(500).json({ message: "Expense not found." });
    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// POST /expenses (create)
router.post("/", async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    const expense = await Expense.create(payload);
    let user = await User.findById(req.user._id);
    user.expenses.push(expense._id);
    user.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /expenses/:expenseId (update)
router.put("/:expenseId", async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /expenses/:expenseId
router.delete("/:expenseId", async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, user: req.user._id },
      req.body,
      { new: true, isDeleted: true },
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Deleted", expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
