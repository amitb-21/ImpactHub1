import CommunityVerification from '../models/CommunityVerification.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { awardCommunityCreation } from '../services/impactService.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as pointsService from '../services/pointsService.js';

// PUBLIC ENDPOINTS

export const submitVerificationRequest = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { registrationNumber, foundedYear, memberCount, pastEventsCount, documents } = req.body;

    // Validate required fields
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

    if (!memberCount || memberCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Member count must be at least 1',
      });
    }

    if (pastEventsCount === undefined || pastEventsCount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Past events count must be 0 or greater',
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    // Check if already has a pending or approved verification
    const existingRequest = await CommunityVerification.findOne({
      community: communityId,
    });

    if (existingRequest && existingRequest.status !== 'rejected') {
      return res.status(409).json({
        success: false,
        message: `Verification request already ${existingRequest.status} for this community`,
      });
    }

    const verification = await CommunityVerification.create({
      community: communityId,
      status: 'pending',
      communityDetails: {
        registrationNumber,
        foundedYear,
        memberCount,
        pastEventsCount,
      },
      documents: documents || [],
    });

    // Create activity record
    await Activity.create({
      user: community.createdBy,
      type: 'verification_requested',
      description: `Submitted verification request for community: ${community.name}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: communityId,
      },
    });

    logger.success(`Verification request submitted for community ${communityId}`);

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      verification: await verification.populate('community', 'name'),
    });
  } catch (error) {
    logger.error('Error submitting verification request', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    const verification = await CommunityVerification.findOne({
      community: communityId,
    }).populate('verifiedBy', 'name email');

    if (!verification) {
      return res.json({
        success: true,
        status: 'unverified',
        verification: null,
      });
    }

    res.json({
      success: true,
      status: verification.status,
      verification,
    });
  } catch (error) {
    logger.error('Error fetching verification status', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ADMIN ONLY ENDPOINTS

export const getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const verifications = await CommunityVerification.find({
      status: 'pending',
    })
      .populate('community', 'name description location image createdBy')
      .populate('community.createdBy', 'name email')
      .sort({ requestedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await CommunityVerification.countDocuments({
      status: 'pending',
    });

    res.json({
      success: true,
      data: verifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching pending verifications', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const approveCommunity = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { notes } = req.body;
    const adminId = req.userId;

    const verification = await CommunityVerification.findById(verificationId).populate('community');

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found',
      });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a ${verification.status} verification`,
      });
    }

    // Update verification status
    verification.status = 'verified';
    verification.verifiedAt = new Date();
    verification.verifiedBy = adminId;
    if (notes) verification.notes = notes;
    await verification.save();

    // Update community verification status
    const community = await Community.findByIdAndUpdate(
      verification.community._id,
      {
        verificationStatus: 'verified',
      },
      { new: true }
    ).populate('createdBy', 'name');

    // Award points to community creator
    await awardCommunityCreation(verification.community.createdBy);

    await pointsService.awardVolunteerCommunityCreationPoints(
      verification.community.createdBy,
      community._id
    );

    await pointsService.awardCommunityVerificationPoints(community._id);

    // Create activity records
    await Activity.create({
      user: adminId,
      type: 'community_verification_verified',
      description: `Approved community verification: ${community.name}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    await Activity.create({
      user: verification.community.createdBy,
      type: 'community_verification_verified',
      description: `Your community "${community.name}" has been verified and approved!`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    logger.success(`Community ${community._id} verified by admin ${adminId}`);

    await verification.save();

socketService.notifyCommunityVerification(
  verification.community.createdBy,
  community._id,
  'verified',
  `Your community "${community.name}" has been verified!`
);

// Notify community members
socketService.emitToCommunity(community._id, 'community:verified', {
  communityId: community._id,
  communityName: community.name,
  message: 'This community is now verified!',
});

    res.json({
      success: true,
      message: 'Community verified successfully! Creator awarded points.',
      verification: await verification.populate('verifiedBy', 'name email'),
      community,
    });
  } catch (error) {
    logger.error('Error approving community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const rejectCommunity = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { rejectionReason, notes } = req.body;
    const adminId = req.userId;

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const verification = await CommunityVerification.findById(verificationId).populate('community');

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found',
      });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a ${verification.status} verification`,
      });
    }

    // Update verification status
    verification.status = 'rejected';
    verification.verifiedAt = new Date();
    verification.verifiedBy = adminId;
    verification.rejectionReason = rejectionReason;
    if (notes) verification.notes = notes;
    await verification.save();

    // Update community verification status
    const community = await Community.findByIdAndUpdate(
      verification.community._id,
      {
        verificationStatus: 'rejected',
      },
      { new: true }
    ).populate('createdBy', 'name');

    // Create activity records
    await Activity.create({
      user: adminId,
      type: 'community_verification_rejected',
      description: `Rejected community verification: ${community.name}. Reason: ${rejectionReason}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    await Activity.create({
      user: verification.community.createdBy,
      type: 'community_verification_rejected',
      description: `Your community "${community.name}" verification was rejected. Reason: ${rejectionReason}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    logger.success(`Community ${community._id} rejected by admin ${adminId}`);

    res.json({
      success: true,
      message: 'Community verification rejected',
      verification: await verification.populate('verifiedBy', 'name email'),
      community,
    });
  } catch (error) {
    logger.error('Error rejecting community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getVerificationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = {};
    if (status) {
      if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter',
        });
      }
      query.status = status;
    }

    const verifications = await CommunityVerification.find(query)
      .populate('community', 'name image')
      .populate('verifiedBy', 'name email')
      .sort({ verifiedAt: -1, requestedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await CommunityVerification.countDocuments(query);

    res.json({
      success: true,
      data: verifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching verification history', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  submitVerificationRequest,
  getVerificationStatus,
  getPendingVerifications,
  approveCommunity,
  rejectCommunity,
  getVerificationHistory,
};