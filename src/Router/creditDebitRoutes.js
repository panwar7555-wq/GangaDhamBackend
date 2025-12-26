const express = require("express");
const router = express.Router();
const CreditDebit = require("../Models/CreditDebit");
const User = require("../Models/User");

// CREATE transaction and update user balance
router.post("/", async (req, res) => {
  try {
    const { date, amount, type, name, link, remark } = req.body;
    const numericAmount = Number(amount); // ✅ ensure amount is a number

    // Create transaction
    const txn = new CreditDebit({ date, amount: numericAmount, type, name, link, remark });
    await txn.save();

    // Find linked user
    const linkedUser = await User.findById(link);
    if (!linkedUser) {
      return res.status(404).json({ error: "Linked user not found" });
    }

    // Update balance based on type
    if (type === "credit") {
      linkedUser.balance += numericAmount;
    } else if (type === "debit") {
      linkedUser.balance -= numericAmount;
    }

    await linkedUser.save();

    res.status(201).json({
      message: "Transaction created and balance updated",
      transaction: txn,
      updatedUser: linkedUser
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all transactions
router.get("/", async (req, res) => {
  try {
    const txns = await CreditDebit.find()
      .sort({ date: -1 })
      .populate("link");
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single transaction by ID
router.get("/:id", async (req, res) => {
  try {
    const txn = await CreditDebit.findById(req.params.id).populate("link");
    if (!txn) return res.status(404).json({ error: "Transaction not found" });
    res.json(txn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE transaction and adjust user balance
router.put("/:id", async (req, res) => {
  try {
    const existingTxn = await CreditDebit.findById(req.params.id);
    if (!existingTxn) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const user = await User.findById(existingTxn.link);
    if (!user) {
      return res.status(404).json({ error: "Linked user not found" });
    }

    // Roll back old transaction effect
    if (existingTxn.type === "credit") {
      user.balance -= Number(existingTxn.amount);
    } else if (existingTxn.type === "debit") {
      user.balance += Number(existingTxn.amount);
    }

    // Apply new values
    existingTxn.date = req.body.date || existingTxn.date;
    existingTxn.amount = req.body.amount !== undefined ? Number(req.body.amount) : existingTxn.amount;
    existingTxn.type = req.body.type || existingTxn.type;
    existingTxn.name = req.body.name || existingTxn.name;
    existingTxn.remark = req.body.remark || existingTxn.remark;

    await existingTxn.save();

    // Apply new transaction effect
    if (existingTxn.type === "credit") {
      user.balance += Number(existingTxn.amount);
    } else if (existingTxn.type === "debit") {
      user.balance -= Number(existingTxn.amount);
    }

    await user.save();

    res.json({
      message: "Transaction updated and balance adjusted",
      transaction: existingTxn,
      updatedUser: user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
  try {
    const txn = await CreditDebit.findByIdAndDelete(req.params.id);
    if (!txn) return res.status(404).json({ error: "Transaction not found" });

    // Roll back balance when deleting
    const user = await User.findById(txn.link);
    if (user) {
      if (txn.type === "credit") {
        user.balance -= Number(txn.amount);
      } else if (txn.type === "debit") {
        user.balance += Number(txn.amount);
      }
      await user.save();
    }

    res.json({ message: "Transaction deleted and balance adjusted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transactions by user link
router.get("/user/:link", async (req, res) => {
  try {
    const txns = await CreditDebit.find({ link: req.params.link })
      .sort({ date: -1 })
      .populate("link");

    if (!txns || txns.length === 0) {
      return res.status(404).json({ error: "No transactions found for this user" });
    }

    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
