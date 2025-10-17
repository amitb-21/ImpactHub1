import mongoose from 'mongoose';

const communityVerificationSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      description: 'Admin who verified',
    },
    rejectionReason: {
      type: String,
      default: null,
      maxlength: 500,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['registration_certificate', 'tax_id', 'mission_statement', 'other'],
        },
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    communityDetails: {
      registrationNumber: String,
      foundedYear: Number,
      memberCount: Number,
      pastEventsCount: Number,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware to update Community model when verification status changes
communityVerificationSchema.post('save', async function () {
  const Community = mongoose.model('Community');
  await Community.findByIdAndUpdate(this.community, {
    verificationStatus: this.status,
  });
});

const CommunityVerification =
  mongoose.models.CommunityVerification ||
  mongoose.model('CommunityVerification', communityVerificationSchema);

export default CommunityVerification;