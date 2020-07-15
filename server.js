const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passportConfig');
const flash = require('connect-flash');
const checkUser = require('./config/loginBlocker');
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


mongoose.connect(process.env.DATABASE, {
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}, () => { console.log("Mongodb connected!"); });

app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 360000 }
  })
);
//-- passport initialization
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(request, response, next) {
  response.locals.alerts = request.flash();
  response.locals.currentUser = request.user;
  next();
});

app.use("/", require("./routes/list.route"));
app.use("/auth", require("./routes/auth.route"));
app.use("/list", require("./routes/list.route"));

app.listen(process.env.PORT, () =>
  console.log(`connected to express on ${process.env.PORT}`)
);
