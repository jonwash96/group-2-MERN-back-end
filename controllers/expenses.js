const router = require("express").Router();
const Expense = require("../models/Expense");
const requireAuth = require("../middleware/requireAuth");
const User = require('../models/User');
// THIS LINE OF CODE SERVES ONE PURPOSE. MAN OVER MACHINE RE: GIT LOG/PUSH

// all expense routes require auth
router.use(requireAuth)

// GET /expenses (index)
router.get("/", async (req, res) => {
  try {
    console.log("@get expenses", req.user)
    const expenses = await Expense.find({ user: req.user._id })
      .sort({ date: -1 })
      // .populate('merchant');

    res.json(expenses);
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
    })
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
