import Event from '../models/Event.js';
import Community from '../models/Community.js';
import { logger } from '../utils/logger.js';

// Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

// Convert miles to kilometers
export const milesToKm = (miles) => miles * 1.60934;

// Convert degrees to radians
export const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return distance; // in km
};

// Get nearby events using geospatial query
export const getNearbyEvents = async (latitude, longitude, radiusKm = 10, limit = 20) => {
  try {
    const events = await Event.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // Note: GeoJSON uses [lon, lat]
          },
          $maxDistance: radiusKm * 1000, // Convert to meters
        },
      },
      status: { $in: ['Upcoming', 'Ongoing'] },
    })
      .populate('community', 'name image')
      .populate('createdBy', 'name profileImage')
      .limit(limit)
      .sort({ startDate: 1 });

    // Add distance to each event
    const eventsWithDistance = events.map((event) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        event.location.coordinates[1],
        event.location.coordinates[0]
      );
      return {
        ...event.toObject(),
        distance: parseFloat(distance.toFixed(2)), // Distance in km
      };
    });

    return eventsWithDistance;
  } catch (error) {
    logger.error('Error finding nearby events', error);
    throw error;
  }
};

// Get nearby communities
export const getNearbyCommunities = async (latitude, longitude, radiusKm = 15, limit = 10) => {
  try {
    const communities = await Community.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      isActive: true,
    })
      .populate('createdBy', 'name profileImage')
      .limit(limit)
      .sort({ totalMembers: -1 });

    // Add distance to each community
    const communitiesWithDistance = communities.map((community) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        community.location.coordinates[1],
        community.location.coordinates[0]
      );
      return {
        ...community.toObject(),
        distance: parseFloat(distance.toFixed(2)),
      };
    });

    return communitiesWithDistance;
  } catch (error) {
    logger.error('Error finding nearby communities', error);
    throw error;
  }
};

// Get events within a bounding box
export const getEventsInBoundingBox = async (swLat, swLng, neLat, neLng, limit = 50) => {
  try {
    const events = await Event.find({
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [swLng, swLat], // Southwest corner
            [neLng, neLat], // Northeast corner
          ],
        },
      },
      status: { $in: ['Upcoming', 'Ongoing'] },
    })
      .populate('community', 'name image')
      .populate('createdBy', 'name profileImage')
      .limit(limit)
      .sort({ startDate: 1 });

    return events;
  } catch (error) {
    logger.error('Error getting events in bounding box', error);
    throw error;
  }
};

// Get events grouped by region/city
export const getEventsByCity = async (city) => {
  try {
    const events = await Event.find({
      'location.city': { $regex: city, $options: 'i' },
      status: { $in: ['Upcoming', 'Ongoing'] },
    })
      .populate('community', 'name')
      .populate('createdBy', 'name profileImage')
      .sort({ startDate: 1 });

    return events;
  } catch (error) {
    logger.error('Error getting events by city', error);
    throw error;
  }
};

// Update event location with coordinates
export const updateEventLocation = async (eventId, address, city, state, zipCode, latitude, longitude) => {
  try {
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        'location.address': address,
        'location.city': city,
        'location.state': state,
        'location.zipCode': zipCode,
        'location.coordinates': [longitude, latitude],
      },
      { new: true }
    );

    logger.success(`Event location updated: ${eventId}`);
    return event;
  } catch (error) {
    logger.error('Error updating event location', error);
    throw error;
  }
};

// Update community location with coordinates
export const updateCommunityLocation = async (communityId, address, city, state, zipCode, latitude, longitude) => {
  try {
    const community = await Community.findByIdAndUpdate(
      communityId,
      {
        'location.address': address,
        'location.city': city,
        'location.state': state,
        'location.zipCode': zipCode,
        'location.coordinates': [longitude, latitude],
      },
      { new: true }
    );

    logger.success(`Community location updated: ${communityId}`);
    return community;
  } catch (error) {
    logger.error('Error updating community location', error);
    throw error;
  }
};

// Get events happening today in a location
export const getEventsToday = async (latitude, longitude, radiusKm = 10) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const events = await Event.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['Upcoming', 'Ongoing'] },
    })
      .populate('community', 'name')
      .populate('createdBy', 'name profileImage')
      .sort({ startDate: 1 });

    return events;
  } catch (error) {
    logger.error('Error getting events today', error);
    throw error;
  }
};

export default {
  calculateDistance,
  getNearbyEvents,
  getNearbyCommunities,
  getEventsInBoundingBox,
  getEventsByCity,
  updateEventLocation,
  updateCommunityLocation,
  getEventsToday,
  milesToKm,
  degreesToRadians,
};