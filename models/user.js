const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        const validator = require("validator");
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid:" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        var validator = require("validator");
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter Strong password" + value);
        }
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Skill@Sync$790", {
    expiresIn: "7d",
  });
  return token;
};


userSchema.methods.validatePassword = async function(password) {
  const user = this
  const passwordHash = user.password
  const isPasswordValid = await bcrypt.compare(password,passwordHash);
  return isPasswordValid
}

module.exports = mongoose.model("User", userSchema);
