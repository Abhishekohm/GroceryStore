const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const Product = require("./models/products");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const flash = require("express-flash");
const { isLoggedIn, validateRForm } = require("./middleware");

mongoose.connect("mongodb://localhost/grocery", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const sessionConfig = {
  secret: "setAGoodSecretInProduction",
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionConfig));

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const Search = (products, key) => {
  return products.filter((product) => {
    for (let tag of product.Tag) {
      if (tag.toUpperCase() === key.toUpperCase()) return true;
    }
    return false;
  });
};

const SearchByID = async (productDatas) => {
  let result = [];
  for (let productData of productDatas) {
    const pushObj = {
      productData: await Product.findById(productData.prodid),
      quantity: productData.quantity,
    };
    result.push(pushObj);
  }
  return result;
};

const filterOff = (arr, key) => {
  let result = arr.filter((product) => {
    if (product.prodid != key) return true;
    else return false;
  });
  return result;
};

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("conneced to mongo");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // path is used so that we can call it from any where
app.use(express.urlencoded({ extended: true })); // TO BE ABLE TO READ FORM DATA
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  const products = await Product.find({});
  res.render("homepage", { products });
});

app.get("/products/:productID", async (req, res) => {
  const { productID } = req.params;
  const product = await Product.findById(productID);
  res.render("show", { product });
});

app.get("/search", async (req, res) => {
  const key = req.query.q;
  if (key) {
    const products = await Product.find({});
    const searchRes = Search(products, key);
    return res.render("searchResult", { searchRes });
  }
  req.flash("error", "Please enter a keyword to search");
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("registerForm");
});

app.post("/register", validateRForm, async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ email, username });
    const newUser = await User.register(user, password);
    req.login(newUser, (err) => {});
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/login", (req, res) => {
  res.render("loginForm");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Successfully logged in!!!!");
    res.redirect("/");
  }
);

app.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.flash("success", "Successfully logged out!!!!");
  res.redirect("/");
});

app.post("/addToCart/:prodID", (req, res) => {
  const { prodID } = req.params;
  const cartData = {
    prodid: prodID,
    quantity: req.body.quantity,
  };
  if (req.session.cart) {
    req.session.cart.push(cartData);
  } else {
    req.session.cart = [cartData];
  }
  req.flash("success", "Successfully Added to your cart");
  res.redirect("/");
});

app.get("/cart", async (req, res, next) => {
  try {
    const productDatas = req.session.cart;
    if (!productDatas || productDatas.length == 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/");
    }
    const products = await SearchByID(productDatas);
    res.render("cart", { products });
  } catch (error) {
    next(error);
  }
});

app.get("/removeFromCart/:productID", (req, res) => {
  const reqObjID = req.params.productID;
  if (!req.session.cart || req.session.cart.length == 0) {
    req.flash("error", "Your cart is empty");
    return res.redirect("/");
  }
  req.session.cart = filterOff(req.session.cart, reqObjID);
  req.flash("success", "Succesfully removed from cart");
  res.redirect("/cart");
});

app.use((err, req, res, next) => {
  res.status(500);
  res.render("error", { err });
});

app.listen(8000);