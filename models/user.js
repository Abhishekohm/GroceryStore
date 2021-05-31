const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLM = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLM); //add username and passport salt and hash feild

module.exports = mongoose.model("User", userSchema);
