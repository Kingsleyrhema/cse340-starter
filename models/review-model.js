const pool = require("../database/")

/* *****************************
 *   Add new review
 * *************************** */
async function addReview(inv_id, account_id, review_title, review_text, review_rating) {
  try {
    const sql = `INSERT INTO reviews (inv_id, account_id, review_title, review_text, review_rating, is_approved) 
                 VALUES ($1, $2, $3, $4, $5, false) RETURNING *`
    return await pool.query(sql, [inv_id, account_id, review_title, review_text, review_rating])
  } catch (error) {
    console.error("addReview error: " + error)
    return error.message
  }
}

/* *****************************
 *   Get reviews by vehicle ID
 * *************************** */
async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname 
                 FROM reviews r 
                 JOIN account a ON r.account_id = a.account_id 
                 WHERE r.inv_id = $1 AND r.is_approved = true 
                 ORDER BY r.review_date DESC`
    return await pool.query(sql, [inv_id])
  } catch (error) {
    console.error("getReviewsByVehicleId error: " + error)
    return new Error("No matching reviews found")
  }
}

/* *****************************
 *   Get all reviews (for admin)
 * *************************** */
async function getAllReviews() {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model, i.inv_year
                 FROM reviews r 
                 JOIN account a ON r.account_id = a.account_id 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 ORDER BY r.review_date DESC`
    return await pool.query(sql)
  } catch (error) {
    console.error("getAllReviews error: " + error)
    return new Error("Error retrieving reviews")
  }
}

/* *****************************
 *   Get pending reviews (for admin approval)
 * *************************** */
async function getPendingReviews() {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model, i.inv_year
                 FROM reviews r 
                 JOIN account a ON r.account_id = a.account_id 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 WHERE r.is_approved = false 
                 ORDER BY r.review_date ASC`
    return await pool.query(sql)
  } catch (error) {
    console.error("getPendingReviews error: " + error)
    return new Error("Error retrieving pending reviews")
  }
}

/* *****************************
 *   Get reviews by account ID
 * *************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year, i.inv_id
                 FROM reviews r 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 WHERE r.account_id = $1 
                 ORDER BY r.review_date DESC`
    return await pool.query(sql, [account_id])
  } catch (error) {
    console.error("getReviewsByAccountId error: " + error)
    return new Error("No matching reviews found")
  }
}

/* *****************************
 *   Get review by ID
 * *************************** */
async function getReviewById(review_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model, i.inv_year
                 FROM reviews r 
                 JOIN account a ON r.account_id = a.account_id 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 WHERE r.review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    return new Error("No matching review found")
  }
}

/* *****************************
 *   Update review approval status
 * *************************** */
async function updateReviewApproval(review_id, is_approved) {
  try {
    const sql = `UPDATE reviews SET is_approved = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE review_id = $2 RETURNING *`
    return await pool.query(sql, [is_approved, review_id])
  } catch (error) {
    console.error("updateReviewApproval error: " + error)
    return error.message
  }
}

/* *****************************
 *   Delete review
 * *************************** */
async function deleteReview(review_id) {
  try {
    const sql = 'DELETE FROM reviews WHERE review_id = $1'
    const data = await pool.query(sql, [review_id])
    return data
  } catch (error) {
    console.error("deleteReview error: " + error)
    return new Error("Delete Review Error")
  }
}

/* *****************************
 *   Update review
 * *************************** */
async function updateReview(review_id, review_title, review_text, review_rating) {
  try {
    const sql = `UPDATE reviews SET review_title = $1, review_text = $2, review_rating = $3, 
                 updated_at = CURRENT_TIMESTAMP, is_approved = false 
                 WHERE review_id = $4 RETURNING *`
    return await pool.query(sql, [review_title, review_text, review_rating, review_id])
  } catch (error) {
    console.error("updateReview error: " + error)
    return error.message
  }
}

/* *****************************
 *   Check if user has already reviewed vehicle
 * *************************** */
async function hasUserReviewed(inv_id, account_id) {
  try {
    const sql = 'SELECT review_id FROM reviews WHERE inv_id = $1 AND account_id = $2'
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("hasUserReviewed error: " + error)
    return false
  }
}

/* *****************************
 *   Get average rating for vehicle
 * *************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `SELECT AVG(review_rating)::NUMERIC(3,2) as avg_rating, COUNT(*) as review_count 
                 FROM reviews WHERE inv_id = $1 AND is_approved = true`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getAverageRating error: " + error)
    return { avg_rating: 0, review_count: 0 }
  }
}

/* *****************************
 *   Get review statistics
 * *************************** */
async function getReviewStats() {
  try {
    const sql = `SELECT 
                   COUNT(*) as total_reviews,
                   COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_reviews,
                   COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_reviews,
                   AVG(review_rating)::NUMERIC(3,2) as avg_rating
                 FROM reviews`
    const result = await pool.query(sql)
    return result.rows[0]
  } catch (error) {
    console.error("getReviewStats error: " + error)
    return { total_reviews: 0, approved_reviews: 0, pending_reviews: 0, avg_rating: 0 }
  }
}

module.exports = {
  addReview,
  getReviewsByVehicleId,
  getAllReviews,
  getPendingReviews,
  getReviewsByAccountId,
  getReviewById,
  updateReviewApproval,
  deleteReview,
  updateReview,
  hasUserReviewed,
  getAverageRating,
  getReviewStats
}