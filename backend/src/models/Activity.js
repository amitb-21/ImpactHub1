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
        'community_joined',
        'community_created',
        'badge_earned',
        'points_earned',
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
        enum: ['Event', 'Community', 'Badge', 'User'],
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