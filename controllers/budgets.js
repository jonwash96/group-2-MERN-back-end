const router = require("express").Router();
const Budget = require("../models/Budget");
const requireAuth = require("../middleware/requireAuth");
router.use(requireAuth);

function formatValidationError(error) {
  if (!error?.errors) return error?.message || "Request failed";
  return Object.values(error.errors)
    .map((e) => e.message)
    .join(", ");
}
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
router.post("/", createBudget);
router.put("/", createBudget);
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
