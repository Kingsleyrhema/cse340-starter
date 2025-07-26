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

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const navList = await utilities.getClassificationsList();
  res.render("./inventory/management", {
    title: "Inventory Management",
    navList,
    active: "Management",
  });
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  const navList = await utilities.getClassificationsList();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    navList,
    active: "Management",
    errors: null,
  });
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  const navList = await utilities.getClassificationsList();
  
  const regResult = await invModel.addClassification(classification_name);
  
  if (regResult) {
    req.flash("notice", `The ${classification_name} classification was successfully added.`);
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      navList: await utilities.getClassificationsList(),
      active: "Management",
    });
  } else {
    req.flash("notice", "Sorry, the classification registration failed.");
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      navList,
      active: "Management",
      errors: null,
    });
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  const navList = await utilities.getClassificationsList();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    navList,
    active: "Management",
    classificationList,
    errors: null,
  });
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const { 
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id 
  } = req.body;
  
  const regResult = await invModel.addInventory(
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id
  );
  
  if (regResult) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`);
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      navList: await utilities.getClassificationsList(),
      active: "Management",
    });
  } else {
    req.flash("notice", "Sorry, the inventory registration failed.");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Inventory",
      navList: await utilities.getClassificationsList(),
      active: "Management",
      classificationList: await utilities.buildClassificationList(classification_id),
      errors: null,
    });
  }
}

module.exports = invCont 