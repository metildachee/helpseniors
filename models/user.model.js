const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSenior: {
    type: Boolean,
    default: false,
  },
  isHelper: {
    type: Boolean,
    default: false,
  },
  registeredLists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }]

});

userSchema.pre("save", function(next) {
  var user = this;
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  //hash the password
  var hash = bcrypt.hashSync(user.password, 10);

  // Override the cleartext password with the hashed one
  user.password = hash;
  next();
});

userSchema.methods.validPassword = function(password) {
  // Compare is a bcrypt method that will return a boolean,
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;