import Community from '../models/Community.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { awardCommunityCreation } from '../services/impactService.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, description, location, category, image } = req.body;
    const userId = req.userId;

    const community = await Community.create({
      name,
      description,
      location,
      category: category || 'Other',
      image,
      createdBy: userId,
      members: [userId],
      totalMembers: 1,
    });

    // Award points to creator
    await awardCommunityCreation(userId);

    // Create activity record
    await Activity.create({
      user: userId,
      type: 'community_created',
      description: `Created community: ${name}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: community._id,
      },
    });

    logger.success(`Community created: ${community._id}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      community: await community.populate('createdBy', 'name profileImage'),
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
    const { category, page = 1, limit = 10, search } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = { isActive: true };

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

    res.json({
      success: true,
      community,
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

    if (community.members.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'Already a member of this community',
      });
    }

    community.members.push(userId);
    community.totalMembers = community.members.length;
    await community.save();

    // Add to user's communities
    await User.findByIdAndUpdate(userId, {
      $addToSet: { communitiesJoined: id },
    });

    // Create activity record
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

export default {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
};