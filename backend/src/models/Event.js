import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
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
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
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
      enum: ['Cleanup', 'Volunteering', 'Education', 'Fundraising', 'Other'],
      default: 'Other',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxParticipants: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    impactPoints: {
      type: Number,
      default: 0,
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
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ community: 1, startDate: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ category: 1 });

// Computed property helper - get available slots
eventSchema.methods.getAvailableSlots = function () {
  if (!this.maxParticipants) return null;
  return Math.max(0, this.maxParticipants - this.participants.length);
};

// Check if event is full
eventSchema.methods.isFull = function () {
  if (!this.maxParticipants) return false;
  return this.participants.length >= this.maxParticipants;
};

// Get capacity percentage
eventSchema.methods.getCapacityPercentage = function () {
  if (!this.maxParticipants) return 0;
  return Math.round((this.participants.length / this.maxParticipants) * 100);
};

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;