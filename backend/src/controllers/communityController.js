import Community from '../models/Community.js';
import CommunityVerification from '../models/CommunityVerification.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { awardCommunityCreation } from '../services/impactService.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as pointsService from '../services/pointsService.js';
import * as socketService from '../services/socketService.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, description, location, category, image, organizationDetails } = req.body;
    const userId = req.userId;

    // Validate organization details
    if (!organizationDetails) {
      return res.status(400).json({
        success: false,
        message: 'Organization details are required',
      });
    }

    const { registrationNumber, foundedYear, memberCount, pastEventsCount, documents } = organizationDetails;

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

    // Create community with UNVERIFIED status
    const community = await Community.create({
      name,
      description,
      location,
      category: category || 'Other',
      image,
      createdBy: userId,
      members: [userId],
      totalMembers: 1,
      verificationStatus: 'pending', // Community is pending verification
      isActive: true, // Community is created but marked as pending
    });

    // Create verification request immediately
    const verification = await CommunityVerification.create({
      community: community._id,
      status: 'pending',
      communityDetails: {
        registrationNumber,
        foundedYear,
        memberCount,
        pastEventsCount,
      },
      documents: documents || [],
    });

    // Award points only after verification (optional - commented out for now)
    // await awardCommunityCreation(userId);

    // Create activity record
    await Activity.create({
      user: userId,
      type: 'community_created',
      description: `Created community: ${name} (Pending verification)`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    logger.success(`Community created and verification requested: ${community._id}`);

    const populatedCommunity = await community.populate('createdBy', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Community created successfully. Awaiting admin verification.',
      community: populatedCommunity,
      verification: await verification.populate('community', 'name'),
    });
  } catch (error) {
    logger.error('Error creating community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getCommunities = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search, showUnverified = false } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = { isActive: true };

    // Only show verified communities by default (unless specifically requested)
    if (showUnverified !== 'true') {
      query.verificationStatus = 'verified';
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name profileImage')
      .populate('members', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Community.countDocuments(query);

    res.json({
      success: true,
      data: communities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching communities', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('members', 'name profileImage email');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Get verification status
    const verification = await CommunityVerification.findOne({ community: id });

    res.json({
      success: true,
      community,
      verification: {
        status: verification?.status || 'unverified',
        verifiedAt: verification?.verifiedAt || null,
        rejectionReason: verification?.rejectionReason || null,
      },
    });
  } catch (error) {
    logger.error('Error fetching community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (community.verificationStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Can only join verified communities',
      });
    }

    if (community.members.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'Already a member of this community',
      });
    }

    const user = await User.findById(userId).select('name profileImage');

    community.members.push(userId);
    community.totalMembers = community.members.length;
    await community.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { communitiesJoined: id },
    });

    // Award points for joining
    await pointsService.awardCommunityMemberJoinedPoints(id, userId);

    await Activity.create({
      user: userId,
      type: 'community_joined',
      description: `Joined community: ${community.name}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    logger.success(`User ${userId} joined community ${id}`);

    socketService.notifyCommunityNewMember(community._id, {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage,
    });

    res.json({
      success: true,
      message: 'Joined community successfully',
      community,
    });
  } catch (error) {
    logger.error('Error joining community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    community.members = community.members.filter((m) => !m.equals(userId));
    community.totalMembers = community.members.length;
    await community.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { communitiesJoined: id },
    });

    logger.success(`User ${userId} left community ${id}`);

    res.json({
      success: true,
      message: 'Left community successfully',
    });
  } catch (error) {
    logger.error('Error leaving community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, category, image } = req.body;
    const userId = req.userId;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (!community.createdBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (category) updateData.category = category;
    if (image) updateData.image = image;

    const updated = await Community.findByIdAndUpdate(id, updateData, { new: true }).populate(
      'createdBy',
      'name profileImage'
    );

    logger.success(`Community updated: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      community: updated,
    });
  } catch (error) {
    logger.error('Error updating community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// GET COMMUNITY VERIFICATION STATUS
export const getCommunityVerificationStatus = async (req, res) => {
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

export default {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getCommunityVerificationStatus,
};