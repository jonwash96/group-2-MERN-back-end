const router = require("express").Router();
const Expense = require("../models/Expense");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/User");
const mongoose = require("mongoose");
// THIS LINE OF CODE SERVES ONE PURPOSE. MAN OVER MACHINE RE: GIT LOG/PUSH

// all expense routes require auth
router.use(requireAuth);

// helpers
function getMonthRangeFromYYYYMM(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month || "");
  if (!match) return { start: null, end: null };

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1; // 0-based
  if (monthIndex < 0 || monthIndex > 11) return { start: null, end: null };

  // Use UTC boundaries to avoid local timezone month-shift bugs.
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

function parseMonthOrRange(req) {
  // supports: ?month=YYYY-MM or ?start=YYYY-MM-DD&end=YYYY-MM-DD
  const { month, start, end } = req.query;

  if (month) {
    return getMonthRangeFromYYYYMM(month);
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

    const filter = { user: req.user._id, isDeleted: { $ne: true } };
    if (start && end) filter.date = { $gte: start, $lt: end };

    const expenses = await Expense.find(filter).sort({ date: -1 });

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

    const match = { user: userId, isDeleted: { $ne: true } };
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
    if (!mongoose.Types.ObjectId.isValid(req.params.expenseId)) {
      return res.status(400).json({ message: "Invalid expense id." });
    }

    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      user: req.user._id,
      isDeleted: { $ne: true },
    });
    // .populate("merchant");

    if (!expense) return res.status(404).json({ message: "Expense not found." });
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
    await user.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /expenses/:expenseId (update)
router.put("/:expenseId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.expenseId)) {
      return res.status(400).json({ message: "Invalid expense id." });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, user: req.user._id, isDeleted: { $ne: true } },
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
    if (!mongoose.Types.ObjectId.isValid(req.params.expenseId)) {
      return res.status(400).json({ message: "Invalid expense id." });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, user: req.user._id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true, runValidators: true },
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Deleted", expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
