const router = require("express").Router();
const Budget = require("../models/Budget");
const requireAuth = require("../middleware/requireAuth");

// all budget routes require auth (same pattern as expenses)
router.use(requireAuth);

function formatValidationError(error) {
  if (!error?.errors) return error?.message || "Request failed";
  return Object.values(error.errors)
    .map((e) => e.message)
    .join(", ");
}

// GET /budgets (index)
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ ownerID: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /budgets/:budgetId (show)
router.get("/:budgetId", async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.budgetId,
      ownerID: req.user._id,
    });

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function createBudget(req, res) {
  try {
    const payload = { ...req.body, ownerID: req.user._id };
    const budget = await Budget.create(payload);

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: formatValidationError(error) });
  }
}

// POST /budgets (create)
router.post("/", createBudget);
// Legacy create route used by older clients
router.put("/", createBudget);

// PUT /budgets/:budgetId (update)
router.put("/:budgetId", async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.budgetId, ownerID: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: formatValidationError(error) });
  }
});

// DELETE /budgets/:budgetId (delete)
router.delete("/:budgetId", async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.budgetId,
      ownerID: req.user._id,
    });

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json({ message: "Deleted", budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
