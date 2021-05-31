const { fruits, vegetables } = require("./images");
const Product = require("./../models/products");
const mongoose = require("mongoose");
const tags = require("./tags");

mongoose.connect("mongodb://localhost/grocery", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("conneced to mongo");
});

const fruitNames = ["Apples", "Mango", "BlueBerries", "NodeBerry", "Banana"];
const vegetableNames = [
  "Onion",
  "Potato",
  "Spinach",
  "Carrot",
  "Brocolli",
  "Capsicum",
  "Pea",
];

seedFruits = async () => {
  for (let fName of fruitNames) {
    const product = new Product({
      Name: fName.toUpperCase(),
      Images: [fruits[fName]],
      Price: Math.floor(50 + Math.random() * 100),
      Tag: tags[fName],
    });
    const res = await product.save();
    console.log(res);
  }
  return;
};

seedVegetable = async () => {
  for (let vName of vegetableNames) {
    const product = new Product({
      Name: vName.toLocaleUpperCase(),
      Images: [vegetables[vName]],
      Price: Math.floor(50 + Math.random() * 100),
      Tag: tags[vName],
    });
    const res = await product.save();
    console.log(res);
  }
  return;
};

Delete = async () => {
  const res = await Product.deleteMany({});
  console.log(res);
  return;
};

seed = () => {
  seedFruits();
  seedVegetable();
  return;
};

seed();
