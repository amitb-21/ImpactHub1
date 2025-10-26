import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'event_joined',
        'event_created',
        'event_attended',
        'event_saved',
        'event_photo_uploaded',
        'community_joined',
        'community_created',
        'community_deactivated', 
        'badge_earned',
        'points_earned',
        'rating_created',
        'verification_requested', 
        'community_verification_verified',
        'community_verification_rejected',
        'user_deactivated',
        'community_manager_application_submitted',
        'community_manager_application_approved',
        'community_manager_application_rejected',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedEntity: {
  entityType: {
    type: String,
    enum: ['Event', 'Community', 'Badge', 'User', 'CommunityManagerApplication'], // ✅ ADD THIS
  },
  entityId: mongoose.Schema.Types.ObjectId,
},
    metadata: {
      pointsEarned: {
        type: Number,
        default: 0,
      },
      additionalInfo: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
export default Activity;