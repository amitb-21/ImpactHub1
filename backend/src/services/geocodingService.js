import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Geocoding Service
 * Converts addresses to coordinates and vice versa using Google Maps API
 * Falls back gracefully if API key not configured
 */

/**
 * Get coordinates from address using Google Geocoding API
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State/Province
 * @param {string} zipCode - Postal code (optional)
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const getCoordinatesFromAddress = async (address, city, state, zipCode = '') => {
  try {
    // Check if API key is configured
    if (!config.GOOGLE_GEOCODING_API_KEY) {
      logger.warn('Google Geocoding API key not configured. Skipping geocoding.');
      return null;
    }

    // Build full address string
    const fullAddress = [address, city, state, zipCode]
      .filter(Boolean)
      .join(', ');

    if (!fullAddress || fullAddress.trim().length === 0) {
      logger.warn('No address components provided for geocoding');
      return null;
    }

    logger.debug(`Geocoding address: ${fullAddress}`);

    // Call Google Geocoding API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: fullAddress,
          key: config.GOOGLE_GEOCODING_API_KEY,
        },
        timeout: 5000, // 5 second timeout
      }
    );

    // Check for errors in response
    if (response.data.status !== 'OK') {
      logger.warn(`Geocoding failed with status: ${response.data.status}`);
      return null;
    }

    // Extract coordinates from first result
    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      
      logger.success(`Geocoded address to: ${lat}, ${lng}`);
      
      return {
        lat: parseFloat(lat.toFixed(6)), // Limit to 6 decimal places
        lng: parseFloat(lng.toFixed(6)),
      };
    }

    logger.warn('No geocoding results found for address');
    return null;
  } catch (error) {
    logger.error('Geocoding service error', error.message);
    // Graceful fallback - return null instead of throwing
    return null;
  }
};

/**
 * Get address from coordinates using reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, city: string, state: string, zipCode: string} | null>}
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      logger.error('Invalid coordinates for reverse geocoding');
      return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      logger.error('Coordinates out of valid range');
      return null;
    }

    // Check if API key is configured
    if (!config.GOOGLE_GEOCODING_API_KEY) {
      logger.warn('Google Geocoding API key not configured. Skipping reverse geocoding.');
      return null;
    }

    logger.debug(`Reverse geocoding coordinates: ${lat}, ${lng}`);

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${lat},${lng}`,
          key: config.GOOGLE_GEOCODING_API_KEY,
        },
        timeout: 5000,
      }
    );

    if (response.data.status !== 'OK' || !response.data.results.length) {
      logger.warn('No reverse geocoding results found');
      return null;
    }

    // Extract address components
    const result = response.data.results[0];
    const addressComponents = {};

    result.address_components.forEach((component) => {
      const types = component.types;
      if (types.includes('street_number')) {
        addressComponents.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        addressComponents.route = component.long_name;
      }
      if (types.includes('locality')) {
        addressComponents.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        addressComponents.state = component.short_name;
      }
      if (types.includes('postal_code')) {
        addressComponents.zipCode = component.long_name;
      }
    });

    const address = [
      addressComponents.streetNumber,
      addressComponents.route,
    ]
      .filter(Boolean)
      .join(' ');

    logger.success(`Reverse geocoded to: ${address}, ${addressComponents.city}`);

    return {
      address: address || result.formatted_address,
      city: addressComponents.city || '',
      state: addressComponents.state || '',
      zipCode: addressComponents.zipCode || '',
    };
  } catch (error) {
    logger.error('Reverse geocoding service error', error.message);
    return null;
  }
};

/**
 * Format coordinates to standard format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} Formatted location object
 */
export const formatCoordinates = (lat, lng) => {
  return {
    type: 'Point',
    coordinates: [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))],
  };
};

/**
 * Validate if a location string contains useful address information
 * @param {string} location - Location string
 * @returns {boolean}
 */
export const isValidLocationString = (location) => {
  if (!location || typeof location !== 'string') {
    return false;
  }

  const trimmed = location.trim();
  return trimmed.length >= 3 && trimmed.length <= 200;
};

/**
 * Parse location string into components
 * Expects format like: "address, city, state, zipcode"
 * @param {string} location - Location string
 * @returns {object} Parsed location components
 */
export const parseLocationString = (location) => {
  if (!isValidLocationString(location)) {
    return { city: '', address: '', state: '', zipCode: '' };
  }

  const parts = location.split(',').map((part) => part.trim());

  return {
    address: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    zipCode: parts[3] || '',
  };
};

export default {
  getCoordinatesFromAddress,
  getAddressFromCoordinates,
  formatCoordinates,
  isValidLocationString,
  parseLocationString,
};