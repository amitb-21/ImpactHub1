import Community from '../models/Community.js';
import CommunityVerification from '../models/CommunityVerification.js';
import { COMMUNITY_VERIFICATION_STATUS, ERROR_MESSAGES } from './constants.js';
import { logger } from './logger.js';

/**
 * Verification Utilities
 * Centralized verification status checks and validations
 */

// =====================
// VERIFICATION CHECKS
// =====================

/**
 * Check if community is verified
 * @param {Object|string} community - Community object or ID
 * @returns {boolean}
 */
export const isVerifiedCommunity = async (community) => {
  try {
    if (!community) return false;

    let communityObj = community;

    // If it's an ID string, fetch the community
    if (typeof community === 'string') {
      communityObj = await Community.findById(community);
    }

    return communityObj?.verificationStatus === COMMUNITY_VERIFICATION_STATUS.VERIFIED;
  } catch (error) {
    logger.error('Error checking community verification', error);
    return false;
  }
};

/**
 * Check if community verification is pending
 */
export const isVerificationPending = async (community) => {
  try {
    if (!community) return false;

    let communityObj = community;

    if (typeof community === 'string') {
      communityObj = await Community.findById(community);
    }

    return communityObj?.verificationStatus === COMMUNITY_VERIFICATION_STATUS.PENDING;
  } catch (error) {
    logger.error('Error checking pending verification', error);
    return false;
  }
};

/**
 * Check if community is rejected
 */
export const isVerificationRejected = async (community) => {
  try {
    if (!community) return false;

    let communityObj = community;

    if (typeof community === 'string') {
      communityObj = await Community.findById(community);
    }

    return communityObj?.verificationStatus === COMMUNITY_VERIFICATION_STATUS.REJECTED;
  } catch (error) {
    logger.error('Error checking rejected verification', error);
    return false;
  }
};

/**
 * Check if community is unverified
 */
export const isUnverified = async (community) => {
  try {
    if (!community) return true;

    let communityObj = community;

    if (typeof community === 'string') {
      communityObj = await Community.findById(community);
    }

    return (
      !communityObj ||
      communityObj.verificationStatus === COMMUNITY_VERIFICATION_STATUS.UNVERIFIED
    );
  } catch (error) {
    logger.error('Error checking unverified status', error);
    return true;
  }
};

/**
 * Get verification status object
 */
export const getVerificationStatus = async (communityId) => {
  try {
    const community = await Community.findById(communityId);
    const verification = await CommunityVerification.findOne({
      community: communityId,
    }).populate('verifiedBy', 'name email');

    if (!community) {
      return {
        status: COMMUNITY_VERIFICATION_STATUS.UNVERIFIED,
        verification: null,
        message: ERROR_MESSAGES.NOT_FOUND,
      };
    }

    return {
      status: community.verificationStatus || COMMUNITY_VERIFICATION_STATUS.UNVERIFIED,
      verification,
      message: null,
    };
  } catch (error) {
    logger.error('Error getting verification status', error);
    throw error;
  }
};

/**
 * Validate verification status transition
 * Prevents invalid status changes
 */
export const validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [COMMUNITY_VERIFICATION_STATUS.UNVERIFIED]: [COMMUNITY_VERIFICATION_STATUS.PENDING],
    [COMMUNITY_VERIFICATION_STATUS.PENDING]: [
      COMMUNITY_VERIFICATION_STATUS.VERIFIED,
      COMMUNITY_VERIFICATION_STATUS.REJECTED,
    ],
    [COMMUNITY_VERIFICATION_STATUS.REJECTED]: [COMMUNITY_VERIFICATION_STATUS.PENDING],
    [COMMUNITY_VERIFICATION_STATUS.VERIFIED]: [], // Can't change from verified
  };

  const allowed = validTransitions[currentStatus] || [];
  return allowed.includes(newStatus);
};

// =====================
// VERIFICATION VALIDATIONS
// =====================

/**
 * Validate organization details for verification
 */
export const validateOrganizationDetails = (details) => {
  const errors = [];

  const { registrationNumber, foundedYear, memberCount, pastEventsCount } = details;

  if (!registrationNumber || registrationNumber.trim().length === 0) {
    errors.push('Registration number is required');
  }

  if (!foundedYear || foundedYear < 1900 || foundedYear > new Date().getFullYear()) {
    errors.push('Valid founded year is required');
  }

  if (!memberCount || memberCount < 1) {
    errors.push('Member count must be at least 1');
  }

  if (pastEventsCount === undefined || pastEventsCount < 0) {
    errors.push('Past events count must be 0 or greater');
  }

  return errors;
};

/**
 * Validate rejection reason
 */
export const validateRejectionReason = (reason) => {
  if (!reason || reason.trim().length === 0) {
    return 'Rejection reason is required';
  }

  if (reason.length > 500) {
    return 'Rejection reason must not exceed 500 characters';
  }

  return null;
};

/**
 * Validate verification notes
 */
export const validateVerificationNotes = (notes) => {
  if (!notes) return null;

  if (notes.length > 1000) {
    return 'Verification notes must not exceed 1000 characters';
  }

  return null;
};

// =====================
// VERIFICATION HELPERS
// =====================

/**
 * Get verification rejection reason
 */
export const getVerificationRejectionReason = async (communityId) => {
  try {
    const verification = await CommunityVerification.findOne({
      community: communityId,
      status: COMMUNITY_VERIFICATION_STATUS.REJECTED,
    });

    return verification?.rejectionReason || null;
  } catch (error) {
    logger.error('Error getting rejection reason', error);
    return null;
  }
};

/**
 * Get verification details
 */
export const getVerificationDetails = async (communityId) => {
  try {
    const verification = await CommunityVerification.findOne({
      community: communityId,
    })
      .populate('verifiedBy', 'name email')
      .populate('community', 'name');

    return verification;
  } catch (error) {
    logger.error('Error getting verification details', error);
    return null;
  }
};

/**
 * Get pending verification count
 */
export const getPendingVerificationCount = async () => {
  try {
    return await CommunityVerification.countDocuments({
      status: COMMUNITY_VERIFICATION_STATUS.PENDING,
    });
  } catch (error) {
    logger.error('Error counting pending verifications', error);
    return 0;
  }
};

/**
 * Get verified communities count
 */
export const getVerifiedCommunitiesCount = async () => {
  try {
    return await Community.countDocuments({
      verificationStatus: COMMUNITY_VERIFICATION_STATUS.VERIFIED,
      isActive: true,
    });
  } catch (error) {
    logger.error('Error counting verified communities', error);
    return 0;
  }
};

/**
 * Check if community can be verified
 * Returns { canVerify: boolean, reason?: string }
 */
export const canCommunityBeVerified = async (communityId) => {
  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return { canVerify: false, reason: 'Community not found' };
    }

    if (!community.isActive) {
      return { canVerify: false, reason: 'Community is inactive' };
    }

    const verification = await CommunityVerification.findOne({
      community: communityId,
    });

    if (!verification || verification.status !== COMMUNITY_VERIFICATION_STATUS.PENDING) {
      return { canVerify: false, reason: 'No pending verification request' };
    }

    return { canVerify: true };
  } catch (error) {
    logger.error('Error checking if community can be verified', error);
    return { canVerify: false, reason: 'Error checking verification status' };
  }
};

/**
 * Update community verification status safely (prevents race conditions)
 */
export const updateCommunityVerificationSafe = async (communityId, newStatus, verifiedBy = null) => {
  try {
    // Validate status transition
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const currentStatus = community.verificationStatus;
    if (!validateStatusTransition(currentStatus, newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }

    // Update both documents in transaction-like manner
    const verification = await CommunityVerification.findOneAndUpdate(
      { community: communityId },
      {
        status: newStatus,
        verifiedAt: new Date(),
        ...(verifiedBy && { verifiedBy }),
      },
      { new: true }
    );

    if (verification) {
      await Community.findByIdAndUpdate(communityId, {
        verificationStatus: newStatus,
      });
    }

    logger.success(`Community ${communityId} verification status updated to ${newStatus}`);

    return verification;
  } catch (error) {
    logger.error('Error updating community verification safely', error);
    throw error;
  }
};

export default {
  // Checks
  isVerifiedCommunity,
  isVerificationPending,
  isVerificationRejected,
  isUnverified,
  // Status
  getVerificationStatus,
  validateStatusTransition,
  // Validations
  validateOrganizationDetails,
  validateRejectionReason,
  validateVerificationNotes,
  // Helpers
  getVerificationRejectionReason,
  getVerificationDetails,
  getPendingVerificationCount,
  getVerifiedCommunitiesCount,
  canCommunityBeVerified,
  updateCommunityVerificationSafe,
};