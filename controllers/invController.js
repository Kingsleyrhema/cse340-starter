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
  try {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryById(inv_id);
    
    if (!data) {
      const error = new Error('Vehicle not found');
      error.status = 404;
      throw error;
    }
    
    const detail = await utilities.buildDetailHTML(data);
    const navList = await utilities.getClassificationsList();
    const title = `${data.inv_make} ${data.inv_model}`;
    const active = data.classification_name || '';
    
    // Get reviews for this vehicle
    const reviewModel = require("../models/review-model");
    const reviews = await reviewModel.getReviewsByVehicleId(inv_id);
    const averageRating = await reviewModel.getAverageRating(inv_id);
    
    // Check if current user has already reviewed this vehicle
    let hasUserReviewed = false;
    if (res.locals.loggedin) {
      hasUserReviewed = await reviewModel.hasUserReviewed(inv_id, res.locals.accountData.account_id);
    }
    
    res.render("./inventory/detail", {
      title,
      navList,
      active,
      detail,
      vehicleData: data,
      reviews: reviews.rows || [],
      averageRating,
      hasUserReviewed,
      inv_id
    });
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const navList = await utilities.getClassificationsList();
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    navList,
    active: "Management",
    classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    
    if (!itemData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv/")
    }
    
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    console.error("Edit inventory view error:", error)
    req.flash("notice", "Error loading vehicle data.")
    res.redirect("/inv/")
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
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
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    
    if (!itemData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv/")
    }
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    console.error("Delete inventory view error:", error)
    req.flash("notice", "Error loading vehicle data.")
    res.redirect("/inv/")
  }
}

/* ***************************
 *  Process delete inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const { inv_id, inv_make, inv_model } = req.body;
    
    const deleteResult = await invModel.deleteInventory(inv_id);
    
    if (deleteResult && deleteResult.rows && deleteResult.rows.length > 0) {
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully deleted.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.redirect("/inv/");
    }
  } catch (error) {
    console.error("Delete inventory error:", error);
    req.flash("notice", "Sorry, the delete failed.");
    res.redirect("/inv/");
  }
}

module.exports = invCont 