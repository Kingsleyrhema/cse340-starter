const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")

/* ****************************************
*  Deliver add review view
* *************************************** */
async function buildAddReview(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    
    // Get vehicle data
    const vehicleData = await invModel.getInventoryById(inv_id)
    
    if (!vehicleData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv/")
    }
    
    // Check if user has already reviewed this vehicle
    const hasReviewed = await reviewModel.hasUserReviewed(inv_id, res.locals.accountData.account_id)
    
    if (hasReviewed) {
      req.flash("notice", "You have already reviewed this vehicle. You can edit your existing review from your account page.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }
    
    res.render("reviews/add-review", {
      title: `Write a Review - ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      classificationList,
      vehicleData,
      errors: null
    })
  } catch (error) {
    console.error("Error in buildAddReview:", error)
    next(error)
  }
}

/* ****************************************
*  Process add review
* *************************************** */
async function addReview(req, res) {
  try {
    let nav = await utilities.getNav()
    const { inv_id, review_title, review_text, review_rating } = req.body
    const account_id = res.locals.accountData.account_id

    const addResult = await reviewModel.addReview(
      inv_id,
      account_id,
      review_title,
      review_text,
      review_rating
    )

    if (addResult && addResult.rows && addResult.rows.length > 0) {
      req.flash(
        "notice",
        "Thank you for your review! It has been submitted for approval and will appear on the vehicle page once approved."
      )
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "Sorry, there was an error submitting your review.")
      res.redirect(`/reviews/add/${inv_id}`)
    }
  } catch (error) {
    console.error("Error in addReview:", error)
    req.flash("notice", "Sorry, there was an error submitting your review.")
    res.redirect("/")
  }
}

/* ****************************************
*  Build edit review view
* *************************************** */
async function buildEditReview(req, res, next) {
  try {
    const review_id = parseInt(req.params.review_id)
    let nav = await utilities.getNav()
    
    const reviewData = await reviewModel.getReviewById(review_id)
    
    if (!reviewData) {
      req.flash("notice", "Review not found.")
      return res.redirect("/account/")
    }
    
    res.render("reviews/edit-review", {
      title: "Edit Review",
      nav,
      reviewData,
      errors: null
    })
  } catch (error) {
    console.error("Error in buildEditReview:", error)
    next(error)
  }
}

/* ****************************************
*  Process edit review
* *************************************** */
async function updateReview(req, res) {
  try {
    const { review_id, review_title, review_text, review_rating } = req.body

    const updateResult = await reviewModel.updateReview(
      review_id,
      review_title,
      review_text,
      review_rating
    )

    if (updateResult && updateResult.rows && updateResult.rows.length > 0) {
      req.flash("notice", "Your review has been updated and is pending approval.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, there was an error updating your review.")
      res.redirect(`/reviews/edit/${review_id}`)
    }
  } catch (error) {
    console.error("Error in updateReview:", error)
    req.flash("notice", "Sorry, there was an error updating your review.")
    res.redirect("/account/")
  }
}

/* ****************************************
*  Build delete review confirmation view
* *************************************** */
async function buildDeleteReview(req, res, next) {
  try {
    const review_id = parseInt(req.params.review_id)
    let nav = await utilities.getNav()
    
    const reviewData = await reviewModel.getReviewById(review_id)
    
    if (!reviewData) {
      req.flash("notice", "Review not found.")
      return res.redirect("/account/")
    }
    
    res.render("reviews/delete-review", {
      title: "Delete Review",
      nav,
      reviewData,
      errors: null
    })
  } catch (error) {
    console.error("Error in buildDeleteReview:", error)
    next(error)
  }
}

/* ****************************************
*  Process delete review
* *************************************** */
async function deleteReview(req, res) {
  try {
    const review_id = parseInt(req.body.review_id)

    const deleteResult = await reviewModel.deleteReview(review_id)

    if (deleteResult && deleteResult.rowCount > 0) {
      req.flash("notice", "Review successfully deleted.")
    } else {
      req.flash("notice", "Error: Review deletion failed.")
    }
    
    res.redirect("/account/")
  } catch (error) {
    console.error("Error in deleteReview:", error)
    req.flash("notice", "Sorry, there was an error deleting the review.")
    res.redirect("/account/")
  }
}

/* ****************************************
*  Build admin review management view
* *************************************** */
async function buildReviewManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    
    // Get pending reviews
    const pendingReviews = await reviewModel.getPendingReviews()
    
    // Get review statistics
    const stats = await reviewModel.getReviewStats()
    
    res.render("reviews/manage-reviews", {
      title: "Review Management",
      nav,
      pendingReviews: pendingReviews.rows || [],
      stats,
      errors: null
    })
  } catch (error) {
    console.error("Error in buildReviewManagement:", error)
    next(error)
  }
}

/* ****************************************
*  Process review approval/rejection
* *************************************** */
async function updateReviewApproval(req, res) {
  try {
    const { review_id, action } = req.body
    const is_approved = action === 'approve'

    if (action === 'delete') {
      const deleteResult = await reviewModel.deleteReview(review_id)
      if (deleteResult && deleteResult.rowCount > 0) {
        req.flash("notice", "Review successfully deleted.")
      } else {
        req.flash("notice", "Error: Review deletion failed.")
      }
    } else {
      const updateResult = await reviewModel.updateReviewApproval(review_id, is_approved)
      
      if (updateResult && updateResult.rows && updateResult.rows.length > 0) {
        const statusText = is_approved ? "approved" : "rejected"
        req.flash("notice", `Review successfully ${statusText}.`)
      } else {
        req.flash("notice", "Error: Review update failed.")
      }
    }
    
    res.redirect("/reviews/manage")
  } catch (error) {
    console.error("Error in updateReviewApproval:", error)
    req.flash("notice", "Sorry, there was an error processing the review.")
    res.redirect("/reviews/manage")
  }
}

/* ****************************************
*  Build user's reviews view
* *************************************** */
async function buildUserReviews(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id
    
    const userReviews = await reviewModel.getReviewsByAccountId(account_id)
    
    res.render("reviews/user-reviews", {
      title: "My Reviews",
      nav,
      reviews: userReviews.rows || [],
      errors: null
    })
  } catch (error) {
    console.error("Error in buildUserReviews:", error)
    next(error)
  }
}

/* ****************************************
*  Build all reviews view (public)
* *************************************** */
async function buildAllReviews(req, res, next) {
  try {
    let nav = await utilities.getNav()
    
    const allReviews = await reviewModel.getAllReviews()
    const stats = await reviewModel.getReviewStats()
    
    res.render("reviews/all-reviews", {
      title: "Customer Reviews",
      nav,
      reviews: allReviews.rows || [],
      stats,
      errors: null
    })
  } catch (error) {
    console.error("Error in buildAllReviews:", error)
    next(error)
  }
}

module.exports = {
  buildAddReview,
  addReview,
  buildEditReview,
  updateReview,
  buildDeleteReview,
  deleteReview,
  buildReviewManagement,
  updateReviewApproval,
  buildUserReviews,
  buildAllReviews
}