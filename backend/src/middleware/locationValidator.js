import { ERROR_MESSAGES } from '../utils/constants.js';

/**
 * ✅ FIXED: Validates location data for creating/updating events and communities
 * Now properly handles location as JSON string from FormData
 */
export const validateLocationData = (req, res, next) => {
  const { location: locationString } = req.body;

  // Location is optional for some endpoints, but if provided, must be valid
  if (!locationString) {
    return next(); // Optional field
  }

  const errors = [];

  try {
    // ✅ Parse location JSON string (comes from FormData)
    const location = JSON.parse(locationString);
    console.log('📍 Validating location:', location);

    // Validate city (required if location provided)
    if (!location.city || location.city.trim().length === 0) {
      errors.push('City is required in location');
    } else if (location.city.length > 100) {
      errors.push('City name must not exceed 100 characters');
    }

    // Validate address (optional)
    if (location.address && location.address.length > 200) {
      errors.push('Address must not exceed 200 characters');
    }

    // Validate state (optional)
    if (location.state && location.state.length > 50) {
      errors.push('State must not exceed 50 characters');
    }

    // Validate zip code (optional)
    if (location.zipCode && location.zipCode.length > 20) {
      errors.push('Zip code must not exceed 20 characters');
    }

    // ✅ Relaxed coordinate validation - allow 0,0 or empty coordinates
    // Coordinates are optional and can be set/updated later
    if (location.latitude || location.longitude) {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      // Only validate if one of them is provided
      if ((location.latitude && isNaN(lat)) || (location.longitude && isNaN(lng))) {
        errors.push('Coordinates must be valid numbers');
      } else {
        // Validate ranges only if coordinates are valid numbers
        if (!isNaN(lat) && (lat < -90 || lat > 90)) {
          errors.push('Latitude must be between -90 and 90');
        }

        if (!isNaN(lng) && (lng < -180 || lng > 180)) {
          errors.push('Longitude must be between -180 and 180');
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors,
      });
    }

    next();
  } catch (e) {
    console.error('❌ Failed to parse location JSON:', e.message);
    return res.status(400).json({
      success: false,
      message: 'Location must be valid JSON format',
      error: e.message,
    });
  }
};

/**
 * Validates location search radius
 * Prevents invalid or excessive radius values
 */
export const validateLocationRadius = (req, res, next) => {
  const radiusKm = req.query.radiusKm;

  if (radiusKm) {
    const radius = parseFloat(radiusKm);

    if (isNaN(radius)) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be a valid number',
      });
    }

    if (radius < 0.1 || radius > 500) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be between 0.1 km and 500 km',
      });
    }
  }

  next();
};

/**
 * Validates coordinates query parameters
 * Used for nearby events/communities queries
 */
export const validateCoordinatesQuery = (req, res, next) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude must be valid numbers',
    });
  }

  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be between -90 and 90',
    });
  }

  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be between -180 and 180',
    });
  }

  // Store parsed values in req for use in controllers
  req.parsedCoordinates = { lat: latitude, lng: longitude };
  next();
};

/**
 * Validates bounding box query parameters
 */
export const validateBoundingBox = (req, res, next) => {
  const { swLat, swLng, neLat, neLng } = req.query;

  if (!swLat || !swLng || !neLat || !neLng) {
    return res.status(400).json({
      success: false,
      message: 'All bounding box coordinates (swLat, swLng, neLat, neLng) are required',
    });
  }

  const SW_LAT = parseFloat(swLat);
  const SW_LNG = parseFloat(swLng);
  const NE_LAT = parseFloat(neLat);
  const NE_LNG = parseFloat(neLng);

  // Validate all are numbers
  if (isNaN(SW_LAT) || isNaN(SW_LNG) || isNaN(NE_LAT) || isNaN(NE_LNG)) {
    return res.status(400).json({
      success: false,
      message: 'All coordinates must be valid numbers',
    });
  }

  // Validate ranges
  if (SW_LAT < -90 || SW_LAT > 90 || NE_LAT < -90 || NE_LAT > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitude values must be between -90 and 90',
    });
  }

  if (SW_LNG < -180 || SW_LNG > 180 || NE_LNG < -180 || NE_LNG > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitude values must be between -180 and 180',
    });
  }

  // Validate that SW is actually southwest of NE
  if (SW_LAT >= NE_LAT || SW_LNG >= NE_LNG) {
    return res.status(400).json({
      success: false,
      message: 'Southwest corner must be south and west of northeast corner',
    });
  }

  req.boundingBox = { swLat: SW_LAT, swLng: SW_LNG, neLat: NE_LAT, neLng: NE_LNG };
  next();
};

export default {
  validateLocationData,
  validateLocationRadius,
  validateCoordinatesQuery,
  validateBoundingBox,
};