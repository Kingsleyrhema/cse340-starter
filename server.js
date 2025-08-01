/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")






/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)


/*
===============================
| View Engine and Templates   |
===============================
*/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Intentional 500 error test route
app.get("/error-test", utilities.handleErrors(baseController.triggerError));

// Suppress favicon.ico 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// File Not Found Route - must be second to last
app.use(async (req, res, next) => {
  const error = new Error('Sorry, we appear to have lost that page.');
  error.status = 404;
  next(error);
});

// Error handler - must be last
app.use(async (err, req, res, next) => {
  console.error("SERVER ERROR:", err); // Log the full error
  const navList = await utilities.getClassificationsList();
  const active = "";

  let message;
  if (err.status == 404) {
    message = err.message || 'Sorry, we appear to have lost that page.';
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }

  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    navList,
    active
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
