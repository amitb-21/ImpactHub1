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
      type: String,
      required: true,
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);
export default Community;