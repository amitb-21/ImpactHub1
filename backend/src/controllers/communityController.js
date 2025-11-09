import Community from '../models/Community.js';
import CommunityVerification from '../models/CommunityVerification.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { awardCommunityCreation } from '../services/impactService.js';
import { buildLocationObject } from '../services/geocodingService.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as pointsService from '../services/pointsService.js';
import * as socketService from '../services/socketService.js';

// ❌ DELETED: createCommunity
// Communities are now created automatically when CM application is approved

export const getCommunities = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = { isActive: true };

    // ✅ UPDATED: Always show verified communities only
    query.verificationStatus = 'verified';

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

    const community = await Community.findById(id).populate('createdBy', 'name profileImage');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Get verification status
    const verification = await CommunityVerification.findOne({ community: id });

    // CORRECTED: Don't include members list in response for regular users
    const response = {
      _id: community._id,
      name: community.name,
      description: community.description,
      image: community.image,
      location: community.location,
      category: community.category,
      createdBy: community.createdBy,
      totalMembers: community.totalMembers,
      totalEvents: community.totalEvents,
      avgRating: community.avgRating,
      totalRatings: community.totalRatings,
      isActive: community.isActive,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };

    // Only moderator/admin/creator can see members
    if (
      req.userRole === 'admin' ||
      community.createdBy._id.equals(req.userId)
    ) {
      response.members = community.members;
    }

    res.json({
      success: true,
      community: response,
      verification: {
        status: verification?.status || 'verified',
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

    console.log('🔄 Join request - Community:', id, 'User:', userId);

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

    const isMember = community.members.some(memberId => 
      memberId.toString() === userId.toString()
    );

    if (isMember) {
      console.log('⚠️ User already a member');
      return res.status(409).json({
        success: false,
        message: 'Already a member of this community',
      });
    }

    const user = await User.findById(userId).select('name profileImage');

    community.members.push(userId);
    community.totalMembers = community.members.length;
    await community.save();

    console.log('✅ User added to community members');

    await User.findByIdAndUpdate(userId, {
      $addToSet: { communitiesJoined: id },
    });

    console.log('✅ Community added to user\'s joined list');

    // ✅ KEY FIX: Check response from points service
    console.log('🏆 Calling awardCommunityMemberJoinedPoints...');
    const pointsResult = await pointsService.awardCommunityMemberJoinedPoints(id, userId);
    
    if (pointsResult.success) {
      console.log('✅ Points awarded successfully:', pointsResult);
    } else {
      console.error('⚠️ Points award failed:', pointsResult.error);
    }

    await Activity.create({
      user: userId,
      type: 'community_joined',
      description: `Joined community: ${community.name}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    console.log('✅ Activity created');

    logger.success(`User ${userId} joined community ${id}`);

    socketService.notifyCommunityNewMember(community._id, {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage,
    });

    // ✅ FIXED: Return updated community with populated members
    const updatedCommunity = await Community.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('members', 'name profileImage email');

    console.log('✅ Returning updated community with members:', {
      membersCount: updatedCommunity.members?.length
    });

    res.json({
      success: true,
      message: 'Joined community successfully',
      community: updatedCommunity,
      isMember: true,
      userId: userId,
      pointsAwarded: pointsResult.pointsAwarded || 0,
    });
  } catch (error) {
    console.error('❌ Error joining community:', error);
    logger.error('Error joining community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
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

    const updatedCommunity = await Community.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('members', 'name profileImage email');

    res.json({
      success: true,
      message: 'Left community successfully',
      community: updatedCommunity,
      isMember: false,
      userId: userId,
    });
  } catch (error) {
    logger.error('Error leaving community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ CORRECTED: Only community creator can update
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

    if (!community.createdBy.equals(userId) && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (image) updateData.image = image;

    if (location) {
      updateData.location = buildLocationObject(location);
    }

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
        status: 'verified',
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

// ✅ NEW: Get community members (only for creator/admin)
export const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    // ✅ Only creator or admin can view members
    if (!community.createdBy.equals(req.userId) && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only community manager can view members',
      });
    }

    const members = await User.find({ _id: { $in: community.members } })
      .select('-googleId -password')
      .limit(limit)
      .skip(skip);

    const total = community.members.length;

    res.json({
      success: true,
      data: members.map((m) => m.toJSON()),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching community members', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getCommunityVerificationStatus,
  getCommunityMembers,
};