const joi = require("joi");
const { userSchema } = require("./validationSchema");

module.exports.isLoggedIn = (req, res, next) => {
  if (req.user) return next();
  req.flash("error", "Login in first");
  req.session.lastPage = req.originalUrl;
  res.redirect("/login");
};

module.exports.validateRForm = async (req, res, next) => {
  const ans = await userSchema.validate(req.body);
  if (!ans.error) return next();
  next(new Error(ans.error.details[0].message));
};
