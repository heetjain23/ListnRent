import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../src/models/Booking.js';
import User from '../src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/listnrent';

async function migrateDeliveryDetails() {
  try {
    console.log('\n📦 Starting Delivery Details Migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all bookings with empty or missing deliveryDetails
    const bookingsWithoutDetails = await Booking.find({
      $or: [
        { deliveryDetails: null },
        { deliveryDetails: undefined },
        { 'deliveryDetails.deliveryAddress': { $exists: false } },
        { 'deliveryDetails.mobileNumber': { $exists: false } }
      ]
    }).populate('listingId').lean();

    console.log(`\n📋 Found ${bookingsWithoutDetails.length} bookings needing migration\n`);

    if (bookingsWithoutDetails.length === 0) {
      console.log('✨ All bookings already have delivery details!\n');
      await mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    const results = [];

    // Process each booking
    for (const booking of bookingsWithoutDetails) {
      try {
        console.log(`\n⏳ Processing booking: ${booking._id}`);
        console.log(`   User ID: ${booking.userId}`);
        console.log(`   Order ID: ${booking.razorpayOrderId || 'N/A'}`);

        // Fetch user profile
        const user = await User.findOne({ uid: booking.userId });

        if (!user) {
          console.log(`   ⚠️  User not found, skipping`);
          skippedCount++;
          results.push({
            bookingId: booking._id,
            status: 'skipped',
            reason: 'User not found'
          });
          continue;
        }

        // Check if user has delivery details
        if (!user.deliveryDetails || !user.deliveryDetails.deliveryAddress) {
          console.log(`   ⚠️  User has no delivery details in profile, skipping`);
          skippedCount++;
          results.push({
            bookingId: booking._id,
            status: 'skipped',
            reason: 'No delivery details in user profile'
          });
          continue;
        }

        // Update booking with user's delivery details
        const updateResult = await Booking.findByIdAndUpdate(
          booking._id,
          {
            deliveryDetails: {
              mobileNumber: user.deliveryDetails.mobileNumber || '',
              deliveryAddress: user.deliveryDetails.deliveryAddress || '',
              landmark: user.deliveryDetails.landmark || '',
              pincode: user.deliveryDetails.pincode || ''
            }
          },
          { new: true }
        );

        console.log(`   ✅ Updated successfully`);
        console.log(`   📍 Address: ${user.deliveryDetails.deliveryAddress}`);
        console.log(`   📞 Mobile: ${user.deliveryDetails.mobileNumber}`);
        
        updatedCount++;
        results.push({
          bookingId: booking._id,
          status: 'updated',
          deliveryDetails: user.deliveryDetails
        });

      } catch (error) {
        console.error(`   ❌ Error processing booking ${booking._id}:`, error.message);
        results.push({
          bookingId: booking._id,
          status: 'error',
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total bookings processed: ${bookingsWithoutDetails.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${results.filter(r => r.status === 'error').length}`);
    console.log('='.repeat(60) + '\n');

    // Log detailed results
    const errors = results.filter(r => r.status === 'error');
    if (errors.length > 0) {
      console.log('❌ Bookings with errors:');
      errors.forEach(r => {
        console.log(`   - ${r.bookingId}: ${r.error}`);
      });
      console.log();
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Migration complete and disconnected from MongoDB\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDeliveryDetails();
