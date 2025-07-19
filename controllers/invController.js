const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const navList = await utilities.getClassificationsList();
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    navList,
    active: className,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryById(inv_id);
  const detail = await utilities.buildDetailHTML(data);
  const navList = await utilities.getClassificationsList();
  const title = data ? `${data.inv_make} ${data.inv_model}` : 'Vehicle Detail';
  const active = data ? data.classification_name : '';
  res.render("./inventory/detail", {
    title,
    navList,
    active,
    detail,
  });
}

module.exports = invCont 