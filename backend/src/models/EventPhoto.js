import mongoose from 'mongoose';

const eventPhotoSchema = new mongoose.Schema(
  {
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    photoType: {
      type: String,
      enum: ['event_preview', 'during_event', 'after_event'],
      default: 'event_preview',
    },
    description: {
      type: String,
      maxlength: 500,
      default: null,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isOfficial: {
      type: Boolean,
      default: false,
      description: 'Official event photo (uploaded by organizer)',
    },
  },
  { timestamps: true }
);

// Index for faster queries
eventPhotoSchema.index({ event: 1, photoType: 1 });
eventPhotoSchema.index({ community: 1 });

const EventPhoto =
  mongoose.models.EventPhoto || mongoose.model('EventPhoto', eventPhotoSchema);

export default EventPhoto;