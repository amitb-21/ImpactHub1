import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    hoursContributed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Registered',
      description: 'Registration status with event organizer verification',
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
      description: 'When attendance was verified by organizer',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      description: 'Community organizer who verified',
    },
    wishlist: {
      isSaved: {
        type: Boolean,
        default: false,
        description: 'Event saved to wishlist',
      },
      savedAt: {
        type: Date,
        default: null,
      },
    },
    rejectionReason: {
      type: String,
      default: null,
      description: 'Why participation was rejected',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate registrations
participationSchema.index({ user: 1, event: 1 }, { unique: true, sparse: true });

const Participation =
  mongoose.models.Participation || mongoose.model('Participation', participationSchema);

export default Participation;