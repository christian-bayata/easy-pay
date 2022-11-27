const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    paidAt: {
      type: Date,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/* Creates the User model */
const User = mongoose.model("User", UserSchema);
module.exports = User;
