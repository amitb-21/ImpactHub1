import mongoose from 'mongoose';

const communityManagerApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Community Information
    communityDetails: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
        enum: ['Environment', 'Education', 'Health', 'Social', 'Other'],
      },
      location: {
        city: String,
        state: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      contactEmail: {
        type: String,
        required: true,
      },
      contactPhone: String,
      website: String,
    },
    // Organization Details
    organizationDetails: {
      registrationNumber: {
        type: String,
        required: true,
        description: 'NGO registration number / Organization ID',
      },
      foundedYear: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear(),
      },
      totalMembers: {
        type: Number,
        required: true,
        min: 1,
      },
      activeMembers: {
        type: Number,
        required: true,
        min: 1,
      },
      pastEventsOrganized: {
        type: Number,
        required: true,
        min: 0,
      },
      avgAttendance: {
        type: Number,
        description: 'Average attendance per event',
      },
      organizationType: {
        type: String,
        enum: ['NGO', 'Social Group', 'Community Initiative', 'Non-Profit', 'Other'],
        required: true,
      },
    },
    // Experience & Qualifications
    managerExperience: {
      yearsOfExperience: {
        type: Number,
        required: true,
        description: 'Years managing community/organization',
      },
      previousRoles: {
        type: String,
        required: true,
        minlength: 30,
        description: 'Previous leadership roles',
      },
      motivation: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 1000,
        description: 'Why they want to manage on ImpactHub',
      },
      goals: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 1000,
        description: 'Community goals on platform',
      },
    },
    // Supporting Documents
    documents: [
      {
        type: {
          type: String,
          enum: [
            'registration_certificate',
            'tax_id',
            'mission_statement',
            'leadership_proof',
            'past_events_proof',
            'other',
          ],
        },
        url: String,
        description: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Admin Review
    adminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      approvalNotes: {
        type: String,
        default: null,
        maxlength: 500,
      },
      rejectionReason: {
        type: String,
        default: null,
        maxlength: 500,
        description: 'Why application was rejected',
      },
    },
    // Communication
    communicationPreference: {
      email: Boolean,
      inApp: Boolean,
    },
    // ✅ NEW FIELD: Link to auto-created community
    communityCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      default: null,
      description: 'Community auto-created when application approved',
      index: true,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Indexes for faster queries
communityManagerApplicationSchema.index({ applicant: 1, status: 1 });
communityManagerApplicationSchema.index({ status: 1, createdAt: -1 });
communityManagerApplicationSchema.index({ 'communityDetails.category': 1 });
communityManagerApplicationSchema.index({ 'communityDetails.location.coordinates': '2dsphere' });
communityManagerApplicationSchema.index({ communityCreated: 1 }); // ✅ NEW INDEX

const CommunityManagerApplication =
  mongoose.models.CommunityManagerApplication ||
  mongoose.model('CommunityManagerApplication', communityManagerApplicationSchema);

export default CommunityManagerApplication;