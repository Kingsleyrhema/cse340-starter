# Customer Reviews System Enhancement

## 📋 Enhancement Overview

This enhancement adds a comprehensive customer review system to the CSE340 Motors application, allowing authenticated users to rate and review vehicles they've experienced, with admin approval workflow.

## 🚀 Features Implemented

### 🔐 Authentication & Authorization
- **User Authentication**: Only logged-in users can write reviews
- **Review Ownership**: Users can only edit/delete their own reviews
- **Admin Controls**: Employees and Admins can manage all reviews
- **Duplicate Prevention**: Users can only review each vehicle once

### 📊 Database Integration
- **New `reviews` Table**: Stores all review data with foreign key relationships
- **Prepared Statements**: All database queries use parameterized statements
- **Indexes**: Performance optimized with strategic database indexes
- **Data Integrity**: Foreign key constraints ensure data consistency

### 🎨 User Interface
- **Responsive Design**: Works on all device sizes
- **Star Ratings**: Visual 1-5 star rating system
- **Rich Forms**: Comprehensive review forms with validation
- **Professional Styling**: Consistent with existing application design

### 🛡️ Security & Validation
- **Client-Side Validation**: HTML5 and JavaScript validation
- **Server-Side Validation**: Express-validator middleware
- **SQL Injection Protection**: Parameterized queries throughout
- **Input Sanitization**: All user inputs properly escaped and validated

### 📈 Admin Features
- **Review Management Dashboard**: Approve, reject, or delete reviews
- **Statistics Overview**: Review counts and average ratings
- **Pending Review Queue**: Streamlined approval workflow

## 🗄️ Database Setup

### 1. Run the SQL Script
Execute the SQL script to create the reviews table and indexes:

```sql
-- Run this in your PostgreSQL database
-- File: database/create-reviews-table.sql
```

### 2. Sample Data (Optional)
The script includes sample review data for testing purposes.

## 🧭 Navigation Guide

### For Customers (Client Accounts):

1. **Browse Vehicles**: Go to any vehicle detail page
2. **Write Reviews**: Click "Write a Review" button (must be logged in)
3. **View Reviews**: See all reviews on vehicle detail pages
4. **Manage Reviews**: Access "My Reviews" from account management page
5. **Edit Reviews**: Click "Edit" on any of your reviews
6. **Delete Reviews**: Click "Delete" on any of your reviews

### For Administrators (Employee/Admin Accounts):

1. **Review Management**: Access from account management page → "Manage Reviews"
2. **Approve Reviews**: Use approve/reject buttons in management dashboard
3. **Delete Reviews**: Remove inappropriate content
4. **View Statistics**: See review counts and average ratings

### Navigation Paths:

#### Writing a Review:
```
Vehicle Detail Page → "Write a Review" → Review Form → Submit → Approval Queue
```

#### Managing Reviews (User):
```
Account Management → "My Reviews" → Edit/Delete individual reviews
```

#### Admin Review Management:
```
Account Management → "Manage Reviews" → Approve/Reject/Delete pending reviews
```

#### Viewing All Reviews:
```
Any Vehicle Detail Page → "View All Reviews" → Public reviews page
```

## 🔧 Technical Implementation

### Model-View-Controller Architecture:

1. **Model** (`models/review-model.js`):
   - `addReview()` - Create new reviews
   - `getReviewsByVehicleId()` - Fetch vehicle reviews
   - `updateReview()` - Edit existing reviews
   - `deleteReview()` - Remove reviews
   - `getAverageRating()` - Calculate ratings
   - `updateReviewApproval()` - Admin approval workflow

2. **Views** (`views/reviews/`):
   - `add-review.ejs` - Review creation form
   - `edit-review.ejs` - Review editing form
   - `delete-review.ejs` - Delete confirmation
   - `user-reviews.ejs` - User's review list
   - `manage-reviews.ejs` - Admin management dashboard
   - `all-reviews.ejs` - Public reviews display

3. **Controller** (`controllers/reviewController.js`):
   - `buildAddReview()` - Render review form
   - `addReview()` - Process new reviews
   - `updateReview()` - Handle review updates
   - `buildReviewManagement()` - Admin dashboard
   - `updateReviewApproval()` - Admin actions

### Routes (`routes/reviewRoute.js`):
```
GET  /reviews/add/:inv_id          - Review form
POST /reviews/add                  - Submit review
GET  /reviews/edit/:review_id      - Edit form
POST /reviews/edit                 - Update review
GET  /reviews/delete/:review_id    - Delete confirmation
POST /reviews/delete               - Delete review
GET  /reviews/my-reviews           - User's reviews
GET  /reviews/manage               - Admin management
POST /reviews/manage               - Admin actions
GET  /reviews/all                  - Public reviews
```

### Validation (`utilities/review-validation.js`):
- **Review Rules**: Title (5-100 chars), Text (10-1000 chars), Rating (1-5)
- **Ownership Checks**: Verify user can edit/delete reviews
- **Duplicate Prevention**: One review per vehicle per user
- **Error Handling**: Return validation errors to forms

## 🧪 Testing Instructions

### 1. Database Setup:
- Ensure PostgreSQL is running
- Execute the SQL script in `database/create-reviews-table.sql`
- Verify table creation and sample data

### 2. User Flow Testing:

#### Customer Testing:
1. Register/login as a regular user
2. Navigate to any vehicle detail page
3. Click "Write a Review"
4. Fill out and submit review form
5. Verify review appears as "Pending Approval"
6. Go to "My Reviews" to see your reviews
7. Edit and delete reviews

#### Admin Testing:
1. Login as Employee or Admin account
2. Go to Account Management → "Manage Reviews"
3. Approve, reject, or delete pending reviews
4. Verify approved reviews appear on vehicle pages
5. Check review statistics

### 3. Validation Testing:
- Submit reviews with invalid data (too short/long text, missing fields)
- Try to review the same vehicle twice
- Attempt to edit someone else's review
- Test unauthorized access to admin features

### 4. Integration Testing:
- Verify reviews display on vehicle detail pages
- Check average ratings calculation
- Test responsive design on mobile devices
- Ensure navigation links work correctly

## 📁 Files Added/Modified

### New Files:
- `models/review-model.js` - Review database operations
- `controllers/reviewController.js` - Review request handling  
- `routes/reviewRoute.js` - Review routing
- `utilities/review-validation.js` - Review validation middleware
- `views/reviews/add-review.ejs` - Add review form
- `views/reviews/edit-review.ejs` - Edit review form
- `views/reviews/delete-review.ejs` - Delete confirmation
- `views/reviews/user-reviews.ejs` - User review management
- `views/reviews/manage-reviews.ejs` - Admin review management
- `views/reviews/all-reviews.ejs` - Public reviews display
- `database/create-reviews-table.sql` - Database setup script

### Modified Files:
- `server.js` - Added review routes
- `controllers/invController.js` - Enhanced vehicle detail view with reviews
- `views/inventory/detail.ejs` - Added reviews section
- `views/account/account-management.ejs` - Added review management links

## 🎯 Enhancement Benefits

1. **Customer Engagement**: Users can share experiences and help others make decisions
2. **Trust Building**: Authentic reviews build confidence in the dealership
3. **Quality Control**: Admin approval ensures appropriate content
4. **SEO Value**: User-generated content improves search rankings
5. **Business Intelligence**: Review data provides customer insights

## 🚨 Security Considerations

- **Authentication Required**: Reviews require user login
- **Authorization Checks**: Users can only modify their own reviews
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries throughout
- **Admin Controls**: Content moderation through approval workflow

This enhancement demonstrates mastery of:
- ✅ Database design and foreign key relationships
- ✅ MVC architecture and separation of concerns
- ✅ Authentication and authorization systems
- ✅ Form validation and error handling
- ✅ Responsive web design
- ✅ Security best practices
- ✅ User experience design