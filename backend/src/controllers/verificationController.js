import CommunityVerification from '../models/CommunityVerification.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

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

    // Check if already has verification request
    const existingRequest = await CommunityVerification.findOne({
      community: communityId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'Verification request already pending for this community',
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
      .populate('community', 'name description location image')
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

export const verifyOrRejectCommunity = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { approved, rejectionReason, notes } = req.body;
    const adminId = req.userId;

    // Validate input
    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'approved must be a boolean',
      });
    }

    if (!approved && (!rejectionReason || rejectionReason.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting',
      });
    }

    const verification = await CommunityVerification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found',
      });
    }

    const community = await Community.findById(verification.community);

    const status = approved ? 'verified' : 'rejected';
    const updateData = {
      status,
      verifiedAt: new Date(),
      verifiedBy: adminId,
    };

    if (!approved) {
      updateData.rejectionReason = rejectionReason || 'Not specified';
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updated = await CommunityVerification.findByIdAndUpdate(verificationId, updateData, {
      new: true,
    })
      .populate('verifiedBy', 'name email')
      .populate('community', 'name');

    // Create activity record
    await Activity.create({
      user: adminId,
      type: 'community_verification_' + status,
      description: `${status.charAt(0).toUpperCase() + status.slice(1)} community: ${community.name}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    logger.success(
      `Community ${community._id} verification ${status} by admin ${adminId}`
    );

    res.json({
      success: true,
      message: `Community ${status} successfully`,
      verification: updated,
    });
  } catch (error) {
    logger.error('Error verifying community', error);
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
      .sort({ verifiedAt: -1 })
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
  verifyOrRejectCommunity,
  getVerificationHistory,
};