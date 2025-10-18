import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    location: {
      address: {
        type: String,
        default: null,
      },
      city: {
        type: String,
        default: null,
      },
      state: {
        type: String,
        default: null,
      },
      zipCode: {
        type: String,
        default: null,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    category: {
      type: String,
      enum: ['Environment', 'Education', 'Health', 'Social', 'Other'],
      default: 'Other',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalMembers: {
      type: Number,
      default: 1,
    },
    totalEvents: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      description: 'Verification status from admin',
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
communitySchema.index({ 'location.coordinates': '2dsphere' });
communitySchema.index({ createdBy: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ verificationStatus: 1 });

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);
export default Community;