import { logger } from '../utils/logger.js';

/**
 * Geocoding Service - SIMPLIFIED FOR LEAFLET
 * 
 * Frontend (React + Leaflet) handles:
 * - Getting user location
 * - Showing map
 * - Converting address to coordinates
 * 
 * Backend only needs:
 * - Format coordinates for storage
 */

/**
 * Format coordinates to standard GeoJSON format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} Formatted location object for MongoDB
 */
export const formatCoordinates = (lat, lng) => {
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    logger.error('Invalid coordinates provided');
    return {
      type: 'Point',
      coordinates: [0, 0],
    };
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    logger.error('Coordinates out of valid range');
    return {
      type: 'Point',
      coordinates: [0, 0],
    };
  }

  return {
    type: 'Point',
    coordinates: [
      parseFloat(lng.toFixed(6)), // Longitude first (GeoJSON standard)
      parseFloat(lat.toFixed(6))  // Latitude second
    ],
  };
};

/**
 * Validate location data structure
 * @param {object} location - Location object from frontend
 * @returns {boolean}
 */
export const isValidLocationData = (location) => {
  if (!location) return false;

  const { coordinates, city } = location;

  // At least coordinates or city required
  if (!coordinates && !city) return false;

  // If coordinates provided, validate them
  if (coordinates) {
    const { lat, lng } = coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  }

  return true;
};

/**
 * Build location object from frontend data
 * Frontend Leaflet sends: { coordinates: {lat, lng}, address, city, state, zipCode }
 * Backend stores this format
 */
export const buildLocationObject = (locationData) => {
  if (!locationData) {
    return {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
  }

  const { coordinates, address, city, state, zipCode } = locationData;

  return {
    address: address || '',
    city: city || '',
    state: state || '',
    zipCode: zipCode || '',
    coordinates: coordinates
      ? formatCoordinates(coordinates.lat, coordinates.lng)
      : {
          type: 'Point',
          coordinates: [0, 0],
        },
  };
};

export default {
  formatCoordinates,
  isValidLocationData,
  buildLocationObject,
};