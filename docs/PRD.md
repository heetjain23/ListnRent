📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
🏷️ Product Name (Working)

ListnRent (temporary — can be changed later)

🧭 1. Product Overview

ListnRent is a peer-to-peer rental platform for ethnic wear, enabling users to:

List unused outfits (kurta, lehenga, saree, etc.)
Rent outfits for short-term use

The platform solves:

High cost of ethnic wear
Low usage frequency (often worn once)
🎯 2. Objectives
Primary Goals:
Build an MVP for Mumbai market
Enable seamless listing & renting
Create a trust-based rental ecosystem
Success Metrics (MVP):
50+ active listings
20+ successful bookings
<5% dispute rate
👥 3. Target Audience
Primary Users:
Age: 18–30
Location: Mumbai
Segments:
College students
Young professionals
Use Cases:
Weddings
Navratri / Garba
Festivals (Diwali, etc.)
Parties & events
💡 4. Value Proposition
For Listers:
Earn money from unused clothes
For Renters:
Access premium outfits at low cost
🧱 5. Product Scope (MVP)
🔐 5.1 Authentication
JWT session management
👤 5.2 User Profile
Name
Phone
Profile image (optional)
👗 5.3 Listing Creation
Required Fields:
Title
Category (Kurta, Lehenga, Saree, Sherwani)
Occasion (Wedding, Festive, Casual)
Size
Description
Price per day
Deposit (default ₹1000)
Condition (New / Like New / Used)
Location (area in Mumbai)
Minimum 3 images
Rules:
Must confirm item is dry cleaned
Monetization:
Listing fee required to publish
🔍 5.4 Browse & Search
Card-based listing feed
Filters:
Category
Size
Price range
Occasion
Location-based (Mumbai only)
📄 5.5 Listing Detail Page
Image gallery
Description
Size & fit notes
Price per day
Deposit amount
Lister info
📅 5.6 Booking System
Select rental dates
Auto price calculation:
Rent × days
Deposit added
💳 5.7 Payment System
Flow:
User pays:
Rent → transferred to lister
Deposit → held by platform
Integration:
Razorpay
🔁 5.8 Pickup & Return
Buyer picks up item from lister
No delivery in MVP
Address revealed after booking confirmation
📸 5.9 Condition Verification System
Before Rental:
Lister uploads outfit condition images
After Return:
Lister uploads return images
⚖️ 5.10 Dispute Handling
Manual admin-based resolution
Admin reviews:
Before/after images
Outcomes:
Full refund
Partial deduction
Full deposit transfer
⭐ 5.11 Relisting Logic
After item is rented:
Listing becomes inactive
Requires new listing fee to relist
💰 6. Revenue Model
MVP:
Listing fee (₹49–₹99 per listing)
Future:
Featured listings
Verified badge
Cleaning service commission
🧠 7. User Flows
👗 Lister Flow:
Signup/Login
Create listing
Pay listing fee
Listing goes live
Accept booking
Hand over item
Receive rent
🛍️ Renter Flow:
Signup/Login
Browse listings
Select outfit
Choose dates
Pay rent + deposit
Pickup item
Return item
Receive deposit refund
🏗️ 8. System Architecture
Backend:
Node.js + Express
MongoDB (Mongoose)
Frontend:
React.js (Web)
Mobile (Future):
React Native (iOS + Android)
Storage:
Cloudinary (images)
Payments:
Razorpay
🔌 9. API Design Overview
Auth:
Listings:
POST /listings
GET /listings
GET /listings/:id
Bookings:
POST /bookings
GET /bookings/user
Payments:
POST /payments/create-order
POST /payments/verify
Disputes:
POST /disputes
📱 10. Mobile Compatibility
Same backend APIs used
JWT-based authentication
Shared business logic
⚠️ 11. Constraints (MVP)
No delivery system
No try-before-rent
No automated dispute system
No advanced verification
🚀 12. Future Enhancements
Delivery integration (Dunzo/Porter)
Try-at-home feature
Platform-owned inventory
Cleaning partnerships
Insurance-based protection
Ratings & reviews system
⚠️ 13. Risks
Low initial supply
Trust issues between users
Hygiene concerns
Operational disputes
📈 14. Launch Strategy
Phase 1:
Launch in Mumbai
Phase 2:
Onboard listings manually:
Friends
College network
Instagram outreach
Phase 3:
Build demand:
Influencers
Festival campaigns
🧠 15. Key Differentiator
Hyperlocal focus
Peer-to-peer model
Deposit-based trust system
✅ Final Note

This PRD is:

MVP-focused (not overbuilt)
Scalable (mobile-ready)
Execution-friendly