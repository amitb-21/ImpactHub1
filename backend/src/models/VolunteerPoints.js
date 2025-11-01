import mongoose from 'mongoose';

const volunteerPointsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    pointsBreakdown: {
      eventParticipation: {
        type: Number,
        default: 0,
        description: 'Points from attending events',
      },
      eventCreation: {
        type: Number,
        default: 0,
        description: 'Points from creating events',
      },
      communityCreation: {
        type: Number,
        default: 0,
        description: 'Points from creating communities',
      },
      communityJoined: {
        type: Number,
        default: 0,
        description: 'Points from joining communities',
      },
      hoursVolunteered: {
        type: Number,
        default: 0,
        description: 'Points from volunteer hours',
      },
      ratings: {
        type: Number,
        default: 0,
        description: 'Points from creating ratings',
      },
      badges: {
        type: Number,
        default: 0,
        description: 'Points from earning badges',
      },
      other: {
        type: Number,
        default: 0,
        description: 'Points from other activities',
      },
    },
    pointsHistory: [
      {
        points: Number,
        type: String,
        description: String,
        eventId: mongoose.Schema.Types.ObjectId,
        relatedEntity: {
          entityType: String,
          entityId: mongoose.Schema.Types.ObjectId,
        },
        awardedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentLevel: {
      type: Number,
      default: 1,
    },
    currentRank: {
      type: String,
      enum: ['Beginner', 'Contributor', 'Leader', 'Champion', 'Legend'],
      default: 'Beginner',
      description: 'User rank based on total points',
    },
    lastPointsUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Add indexes for faster queries - only once each
volunteerPointsSchema.index({ user: 1 }, { unique: true });
volunteerPointsSchema.index({ totalPoints: -1 });
volunteerPointsSchema.index({ currentRank: 1 });
volunteerPointsSchema.index({ 'pointsHistory.awardedAt': -1 });

const VolunteerPoints = mongoose.models.VolunteerPoints || mongoose.model('VolunteerPoints', volunteerPointsSchema);
export default VolunteerPoints;