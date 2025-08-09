const utilities = require(".")
const { body, validationResult } = require("express-validator")
const reviewModel = require("../models/review-model")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // Review title is required and must be reasonable length
    body("review_title")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters."),

    // Review text is required and must be reasonable length
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),

    // Rating must be between 1 and 5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // Vehicle ID must be provided and be a number
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("Valid vehicle ID is required."),
  ]
}

/*  **********************************
 *  Review Update Validation Rules
 * ********************************* */
validate.reviewUpdateRules = () => {
  return [
    // Review title is required and must be reasonable length
    body("review_title")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters."),

    // Review text is required and must be reasonable length
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),

    // Rating must be between 1 and 5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // Review ID must be provided
    body("review_id")
      .isInt({ min: 1 })
      .withMessage("Valid review ID is required."),
  ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_title, review_text, review_rating, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    
    // Get vehicle data for the review form
    const invModel = require("../models/inventory-model")
    const vehicleData = await invModel.getInventoryById(inv_id)
    
    res.render("reviews/add-review", {
      errors,
      title: "Write a Review",
      nav,
      classificationList,
      vehicleData,
      review_title,
      review_text,
      review_rating,
    })
    return
  }
  next()
}

/* ******************************
 * Check review update data and return errors or continue
 * ***************************** */
validate.checkReviewUpdateData = async (req, res, next) => {
  const { review_title, review_text, review_rating, review_id } = req.body
  let errors = []
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    
    // Get review data for the edit form
    const reviewData = await reviewModel.getReviewById(review_id)
    
    res.render("reviews/edit-review", {
      errors,
      title: "Edit Review",
      nav,
      reviewData,
      review_title,
      review_text,
      review_rating,
    })
    return
  }
  next()
}

/* ******************************
 * Check if user has already reviewed this vehicle
 * ***************************** */
validate.checkDuplicateReview = async (req, res, next) => {
  const { inv_id } = req.body
  const account_id = res.locals.accountData.account_id
  
  try {
    const hasReviewed = await reviewModel.hasUserReviewed(inv_id, account_id)
    
    if (hasReviewed) {
      req.flash("notice", "You have already reviewed this vehicle. You can edit your existing review from your account page.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }
    
    next()
  } catch (error) {
    req.flash("notice", "An error occurred while checking your review status.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ******************************
 * Check review ownership for editing/deleting
 * ***************************** */
validate.checkReviewOwnership = async (req, res, next) => {
  try {
    const review_id = req.params.review_id || req.body.review_id
    const reviewData = await reviewModel.getReviewById(review_id)
    const account_id = res.locals.accountData.account_id
    const account_type = res.locals.accountData.account_type
    
    // Allow if user owns the review OR is admin/employee
    if (reviewData.account_id === account_id || account_type === "Admin" || account_type === "Employee") {
      next()
    } else {
      req.flash("notice", "You do not have permission to modify this review.")
      return res.redirect("/account/")
    }
  } catch (error) {
    req.flash("notice", "Review not found or access denied.")
    return res.redirect("/account/")
  }
}

module.exports = validate