// backend/src/models/CommunityRewards.js

import mongoose from 'mongoose';

const communityRewardsSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      unique: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    pointsBreakdown: {
      creationBonus: {
        type: Number,
        default: 0,
        description: 'Points for creating the community',
      },
      memberJoined: {
        type: Number,
        default: 0,
        description: 'Points from members joining',
      },
      eventsCreated: {
        type: Number,
        default: 0,
        description: 'Points from organizing events',
      },
      participationRewards: {
        type: Number,
        default: 0,
        description: 'Points from participant activities',
      },
      communityRatings: {
        type: Number,
        default: 0,
        description: 'Points from community ratings',
      },
      verificationBonus: {
        type: Number,
        default: 0,
        description: 'Points from community verification',
      },
      milestoneRewards: {
        type: Number,
        default: 0,
        description: 'Points from reaching milestones',
      },
      other: {
        type: Number,
        default: 0,
        description: 'Points from other activities',
      },
    },
    rewardsHistory: [
      {
        points: Number,
        type: String, // member_joined, event_created, etc.
        description: String,
        relatedUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        relatedEntity: {
          entityType: String, // Event, User, etc.
          entityId: mongoose.Schema.Types.ObjectId,
        },
        awardedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    communityTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze',
      description: 'Community tier based on total points and activity',
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    totalEvents: {
      type: Number,
      default: 0,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'pending',
    },
    metrics: {
      avgRating: {
        type: Number,
        default: 0,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      memberGrowthRate: {
        type: Number,
        default: 0,
        description: 'Members joined in last 30 days',
      },
      eventFrequency: {
        type: Number,
        default: 0,
        description: 'Events created in last 30 days',
      },
    },
    achievements: [
      {
        type: String,
        enum: [
          'first_event',
          'ten_events',
          'fifty_events',
          'hundred_events',
          'verified_community',
          'hundred_members',
          'thousand_members',
          'high_rating',
          'active_community',
        ],
      },
    ],
    lastPointsUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
communityRewardsSchema.index({ community: 1 });
communityRewardsSchema.index({ totalPoints: -1 }); // For leaderboard
communityRewardsSchema.index({ communityTier: 1 });
communityRewardsSchema.index({ verificationStatus: 1 });
communityRewardsSchema.index({ 'rewardsHistory.awardedAt': -1 });

const CommunityRewards = mongoose.models.CommunityRewards || mongoose.model('CommunityRewards', communityRewardsSchema);
export default CommunityRewards;