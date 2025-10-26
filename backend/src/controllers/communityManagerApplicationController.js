import CommunityManagerApplication from '../models/CommunityManagerApplication.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as socketService from '../services/socketService.js';

// ✅ USER: Apply to become community manager
export const applyAsCommunityManager = async (req, res) => {
  try {
    const applicantId = req.userId;
    const {
      communityDetails,
      organizationDetails,
      managerExperience,
      documents,
      communicationPreference,
    } = req.body;

    // ✅ Validate community details
    if (!communityDetails || !communityDetails.name || !communityDetails.description) {
      return res.status(400).json({
        success: false,
        message: 'Community details (name, description) are required',
      });
    }

    if (!communityDetails.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(communityDetails.contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Valid contact email is required',
      });
    }

    // ✅ Validate organization details
    if (!organizationDetails) {
      return res.status(400).json({
        success: false,
        message: 'Organization details are required',
      });
    }

    const {
      registrationNumber,
      foundedYear,
      totalMembers,
      activeMembers,
      pastEventsOrganized,
      organizationType,
    } = organizationDetails;

    if (!registrationNumber || registrationNumber.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Registration number is required',
      });
    }

    if (!foundedYear || foundedYear < 1900 || foundedYear > new Date().getFullYear()) {
      return res.status(400).json({
        success: false,
        message: 'Valid founded year is required',
      });
    }

    if (!totalMembers || totalMembers < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total members must be at least 1',
      });
    }

    if (!activeMembers || activeMembers < 1) {
      return res.status(400).json({
        success: false,
        message: 'Active members must be at least 1',
      });
    }

    if (pastEventsOrganized === undefined || pastEventsOrganized < 0) {
      return res.status(400).json({
        success: false,
        message: 'Past events count must be 0 or greater',
      });
    }

    if (!organizationType) {
      return res.status(400).json({
        success: false,
        message: 'Organization type is required',
      });
    }

    // ✅ Validate manager experience
    if (!managerExperience) {
      return res.status(400).json({
        success: false,
        message: 'Manager experience details are required',
      });
    }

    if (
      managerExperience.yearsOfExperience === undefined ||
      managerExperience.yearsOfExperience < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Years of experience is required',
      });
    }

    if (!managerExperience.previousRoles || managerExperience.previousRoles.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Previous roles description must be at least 30 characters',
      });
    }

    if (!managerExperience.motivation || managerExperience.motivation.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Motivation must be at least 50 characters',
      });
    }

    if (!managerExperience.goals || managerExperience.goals.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Goals description must be at least 50 characters',
      });
    }

    // ✅ Check if user already has pending application
    const existingApp = await CommunityManagerApplication.findOne({
      applicant: applicantId,
      status: 'pending',
    });

    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending community manager application',
        applicationId: existingApp._id,
        submittedOn: existingApp.createdAt,
      });
    }

    // ✅ Check if rejected - can reapply after 30 days
    const rejectedApp = await CommunityManagerApplication.findOne({
      applicant: applicantId,
      status: 'rejected',
    }).sort({ createdAt: -1 });

    if (rejectedApp) {
      const daysSinceRejection = Math.floor(
        (Date.now() - rejectedApp.createdAt) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceRejection < 30) {
        return res.status(400).json({
          success: false,
          message: `You can reapply in ${30 - daysSinceRejection} days`,
          rejectionReason: rejectedApp.adminReview.rejectionReason,
          rejectedOn: rejectedApp.createdAt,
        });
      }
    }

    // ✅ Check if user is already moderator/admin
    const user = await User.findById(applicantId);
    if (['moderator', 'admin'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a community manager or admin',
      });
    }

    // ✅ Create application
    const application = await CommunityManagerApplication.create({
      applicant: applicantId,
      communityDetails: {
        ...communityDetails,
        location: communityDetails.location || {},
      },
      organizationDetails,
      managerExperience,
      documents: documents || [],
      communicationPreference: communicationPreference || {
        email: true,
        inApp: true,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // ✅ Create activity log
    await Activity.create({
      user: applicantId,
      type: 'community_manager_application_submitted',
      description: `Applied to manage community: ${communityDetails.name}`,
      relatedEntity: {
        entityType: 'CommunityManagerApplication',
        entityId: application._id,
      },
    });
    socketService.notifyAdminsNewCommunityManagerApplication(
  user.name,
  communityDetails.name,
  application._id
);

    logger.success(`Community manager application submitted by user ${applicantId}`);

    res.status(201).json({
      success: true,
      message:
        'Application submitted successfully! Admins will review your application within 3-5 business days.',
      application: {
        _id: application._id,
        status: application.status,
        communityName: application.communityDetails.name,
        submittedAt: application.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error applying as community manager', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ USER: Get their application status
export const getMyApplication = async (req, res) => {
  try {
    const applicantId = req.userId;

    const application = await CommunityManagerApplication.findOne({
      applicant: applicantId,
    })
      .populate('applicant', 'name email profileImage')
      .populate('adminReview.reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    if (!application) {
      return res.json({
        success: true,
        message: 'No application found',
        application: null,
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    logger.error('Error fetching application', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ USER: Get application history
export const getApplicationHistory = async (req, res) => {
  try {
    const applicantId = req.userId;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const applications = await CommunityManagerApplication.find({
      applicant: applicantId,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CommunityManagerApplication.countDocuments({
      applicant: applicantId,
    });

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching application history', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ ADMIN: Get all pending applications
export const getPendingApplications = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const applications = await CommunityManagerApplication.find({ status })
      .populate('applicant', 'name email profileImage')
      .populate('adminReview.reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CommunityManagerApplication.countDocuments({ status });

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching pending applications', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ ADMIN: View single application
export const viewApplication = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { applicationId } = req.params;

    const application = await CommunityManagerApplication.findById(applicationId)
      .populate('applicant', 'name email profileImage createdAt')
      .populate('adminReview.reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    logger.error('Error fetching application', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ ADMIN: Approve application
export const approveApplication = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { applicationId } = req.params;
    const { approvalNotes } = req.body;
    const adminId = req.userId;

    const application = await CommunityManagerApplication.findById(
      applicationId
    ).populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a ${application.status} application`,
      });
    }

    // ✅ Update application
    application.status = 'approved';
    application.adminReview.reviewedBy = adminId;
    application.adminReview.reviewedAt = new Date();
    application.adminReview.approvalNotes = approvalNotes || null;
    await application.save();

    // ✅ Promote user to moderator
    const user = await User.findByIdAndUpdate(
      application.applicant._id,
      { role: 'moderator' },
      { new: true }
    );

    // ✅ Create activity logs
    await Activity.create({
      user: adminId,
      type: 'community_manager_application_approved',
      description: `Approved community manager application for ${application.communityDetails.name}`,
      relatedEntity: {
        entityType: 'CommunityManagerApplication',
        entityId: application._id,
      },
    });

    await Activity.create({
      user: application.applicant._id,
      type: 'community_manager_application_approved',
      description: `Your community manager application for "${application.communityDetails.name}" was approved!`,
      relatedEntity: {
        entityType: 'CommunityManagerApplication',
        entityId: application._id,
      },
    });

    // ✅ Send notification
    socketService.notifyCommunityManagerApproved(
      application.applicant._id,
      application.communityDetails.name,
      application._id
    );

    logger.success(`Application approved: ${applicationId}`);

    res.json({
      success: true,
      message: 'Application approved! User promoted to community manager.',
      application,
      user,
    });
  } catch (error) {
    logger.error('Error approving application', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ ADMIN: Reject application
export const rejectApplication = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { applicationId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.userId;

    // ✅ Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    if (rejectionReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason must not exceed 500 characters',
      });
    }

    const application = await CommunityManagerApplication.findById(
      applicationId
    ).populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a ${application.status} application`,
      });
    }

    // ✅ Update application
    application.status = 'rejected';
    application.adminReview.reviewedBy = adminId;
    application.adminReview.reviewedAt = new Date();
    application.adminReview.rejectionReason = rejectionReason;
    await application.save();

    // ✅ Create activity logs
    await Activity.create({
      user: adminId,
      type: 'community_manager_application_rejected',
      description: `Rejected community manager application for ${application.communityDetails.name}. Reason: ${rejectionReason}`,
      relatedEntity: {
        entityType: 'CommunityManagerApplication',
        entityId: application._id,
      },
    });

    await Activity.create({
      user: application.applicant._id,
      type: 'community_manager_application_rejected',
      description: `Your community manager application was not approved. Reason: ${rejectionReason}. You can reapply in 30 days.`,
      relatedEntity: {
        entityType: 'CommunityManagerApplication',
        entityId: application._id,
      },
    });

    // ✅ Send notification
    socketService.notifyCommunityManagerRejected(
      application.applicant._id,
      application.communityDetails.name,
      rejectionReason
    );

    logger.success(`Application rejected: ${applicationId}`);

    res.json({
      success: true,
      message: 'Application rejected. User notified.',
      application,
    });
  } catch (error) {
    logger.error('Error rejecting application', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  applyAsCommunityManager,
  getMyApplication,
  getApplicationHistory,
  getPendingApplications,
  viewApplication,
  approveApplication,
  rejectApplication,
};