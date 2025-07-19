const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const navList = await utilities.getClassificationsList();
  res.render("index", {title: "Home", navList, active: "Home"})
}

baseController.triggerError = async function(req, res, next) {
  throw new Error("Intentional 500 error for testing");
}

module.exports = baseController 