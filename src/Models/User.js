const mongoose = require("mongoose"); 
const userSchema = new mongoose.Schema(
    { 
        name: { type: String, required: true, trim: true }, 
        phoneNumber: { type: String, trim: true }, 
        balance: { type: Number, default: 0 } 
    }
); 
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
