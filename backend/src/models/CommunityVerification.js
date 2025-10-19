import mongoose from 'mongoose';

const communityVerificationSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
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
      description: 'Why verification was rejected',
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
      maxlength: 1000,
      description: 'Admin notes for internal reference',
    },
  },
  { timestamps: true }
);

communityVerificationSchema.index({ community: 1, status: 1 });
communityVerificationSchema.index({ status: 1, requestedAt: -1 });
communityVerificationSchema.index({ verifiedAt: -1 });

// Middleware to update Community model when verification status changes
communityVerificationSchema.post('save', async function () {
  try {
    const Community = mongoose.model('Community');
    // Only update if this is a verified or rejected status
    if (this.status !== 'pending') {
      await Community.findByIdAndUpdate(this.community, {
        verificationStatus: this.status,
      });
    }
  } catch (error) {
    console.error('Error updating community verification status:', error);
  }
});

communityVerificationSchema.post('findByIdAndUpdate', async function (doc) {
  try {
    if (doc && doc.status !== 'pending') {
      const Community = mongoose.model('Community');
      await Community.findByIdAndUpdate(doc.community, {
        verificationStatus: doc.status,
      });
    }
  } catch (error) {
    console.error('Error updating community verification status:', error);
  }
});

const CommunityVerification =
  mongoose.models.CommunityVerification ||
  mongoose.model('CommunityVerification', communityVerificationSchema);

export default CommunityVerification;