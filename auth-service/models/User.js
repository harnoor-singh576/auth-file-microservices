const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(
            value
          );
        },
        message:
          "Password must include uppercase, lowercase, number, and special character",
      },
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model("User", userSchema);
