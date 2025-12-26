const mongoose = require("mongoose");

const creditDebitSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // Foreign key reference to User schema
    required: true
  },
  remark: { type: String, trim: true }
});

module.exports = mongoose.model("CreditDebit", creditDebitSchema);
