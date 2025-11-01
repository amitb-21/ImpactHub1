import mongoose from 'mongoose';

const impactMetricSchema = new mongoose.Schema(
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
    eventsParticipated: {
      type: Number,
      default: 0,
    },
    eventsCreated: {
      type: Number,
      default: 0,
    },
    communitiesJoined: {
      type: Number,
      default: 0,
    },
    communitiesCreated: {
      type: Number,
      default: 0,
    },
    hoursVolunteered: {
      type: Number,
      default: 0,
    },
    co2Reduced: {
      type: Number,
      default: 0,
      description: 'In kg',
    },
    treesPlanted: {
      type: Number,
      default: 0,
    },
    peopleHelped: {
      type: Number,
      default: 0,
    },
    impactStreak: {
      type: Number,
      default: 0,
      description: 'Consecutive days with activity',
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    level: {
      type: Number,
      default: 1,
      description: 'User level based on points',
    },
  },
  { timestamps: true }
);

impactMetricSchema.index({ user: 1 }, { unique: true });

const ImpactMetric = mongoose.models.ImpactMetric || mongoose.model('ImpactMetric', impactMetricSchema);
export default ImpactMetric;