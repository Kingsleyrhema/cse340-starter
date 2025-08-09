-- Create reviews table for customer vehicle reviews
-- This script should be run in your PostgreSQL database

CREATE TABLE IF NOT EXISTS public.reviews (
    review_id SERIAL PRIMARY KEY,
    inv_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    review_title VARCHAR(100) NOT NULL,
    review_text TEXT NOT NULL,
    review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inv_id) REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES public.account(account_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_inv_id ON public.reviews(inv_id);
CREATE INDEX IF NOT EXISTS idx_reviews_account_id ON public.reviews(account_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(review_rating);

-- Add some sample data (optional - you can remove this in production)
-- Note: Make sure the inv_id and account_id values exist in your database
INSERT INTO public.reviews (inv_id, account_id, review_title, review_text, review_rating, is_approved) VALUES
(1, 1, 'Excellent Vehicle!', 'This car exceeded my expectations. Great performance and fuel efficiency. Highly recommend!', 5, true),
(1, 2, 'Good but pricey', 'Nice car overall, but I think it''s a bit overpriced for what you get. Still satisfied with the purchase.', 4, true),
(2, 1, 'Amazing Sports Car', 'This is the car of my dreams! Fast, stylish, and turns heads everywhere I go. Worth every penny!', 5, true);

-- Grant permissions (adjust as needed for your database setup)
-- GRANT ALL PRIVILEGES ON public.reviews TO your_database_user;
-- GRANT USAGE, SELECT ON SEQUENCE reviews_review_id_seq TO your_database_user;