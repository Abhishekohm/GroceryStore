const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  Images: {
    type: [String],
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  Tag: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
