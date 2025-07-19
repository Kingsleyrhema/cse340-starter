const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid;
  if(data.length > 0){
    grid = '<ul class="vehicle-grid">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid +=  `<a href="/inv/detail/${vehicle.inv_id}"><img src="${vehicle.inv_image}" alt=""></a>`;
      grid +=  `<a href="/inv/detail/${vehicle.inv_id}" class="vehicle-link">${vehicle.inv_make} ${vehicle.inv_model}</a>`;
      grid +=  `<div class="vehicle-price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</div>`;
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildDetailHTML = async function(data) {
  if (!data) {
    return '<p class="notice">Sorry, vehicle not found.</p>';
  }
  let html = `
    <div class="vehicle-detail-flex">
      <div class="vehicle-detail-image">
        <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      </div>
      <div class="vehicle-detail-info-box">
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model} Details</h2>
        <div class="vehicle-detail-row"><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(data.inv_price)}</div>
        <div class="vehicle-detail-row"><strong>Description:</strong> ${data.inv_description}</div>
        <div class="vehicle-detail-row"><strong>Color:</strong> ${data.inv_color}</div>
        <div class="vehicle-detail-row"><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</div>
      </div>
    </div>
  `;
  return html;
}

/* ************************
 * Get classifications list for dynamic navigation
 ************************** */
Util.getClassificationsList = async function () {
  return await invModel.getClassifications();
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util 