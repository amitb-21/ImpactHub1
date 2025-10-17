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
      enum: ['Registered', 'Attended', 'Completed', 'Cancelled'],
      default: 'Registered',
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: null,
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
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const Participation = mongoose.models.Participation || mongoose.model('Participation', participationSchema);
export default Participation;