// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require('../utilities/review-validation')

// Route to build add review view (requires login)
router.get("/add/:inv_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildAddReview)
)

// Route to process add review (requires login and validation)
router.post("/add",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkDuplicateReview,
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to build edit review view (requires login and ownership)
router.get("/edit/:review_id", 
  utilities.checkLogin,
  reviewValidate.checkReviewOwnership,
  utilities.handleErrors(reviewController.buildEditReview)
)

// Route to process edit review (requires login, ownership, and validation)
router.post("/edit",
  utilities.checkLogin,
  reviewValidate.checkReviewOwnership,
  reviewValidate.reviewUpdateRules(),
  reviewValidate.checkReviewUpdateData,
  utilities.handleErrors(reviewController.updateReview)
)

// Route to build delete review view (requires login and ownership)
router.get("/delete/:review_id", 
  utilities.checkLogin,
  reviewValidate.checkReviewOwnership,
  utilities.handleErrors(reviewController.buildDeleteReview)
)

// Route to process delete review (requires login and ownership)
router.post("/delete",
  utilities.checkLogin,
  reviewValidate.checkReviewOwnership,
  utilities.handleErrors(reviewController.deleteReview)
)

// Route to build user's reviews view (requires login)
router.get("/my-reviews", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildUserReviews)
)

// Route to build review management view (requires admin/employee)
router.get("/manage", 
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.buildReviewManagement)
)

// Route to process review approval/rejection (requires admin/employee)
router.post("/manage",
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.updateReviewApproval)
)

// Route to build all reviews view (public)
router.get("/all", 
  utilities.handleErrors(reviewController.buildAllReviews)
)

module.exports = router