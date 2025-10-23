import { useState, useEffect, useCallback } from 'react';

/**
 * useGeolocation Hook
 * Gets user's current location using Geolocation API
 * 
 * Usage:
 * const { latitude, longitude, loading, error, requestLocation, accuracy, timestamp } = useGeolocation();
 * 
 * Returns:
 * - latitude: User's latitude
 * - longitude: User's longitude
 * - accuracy: Accuracy in meters
 * - timestamp: When location was fetched
 * - loading: Loading state
 * - error: Error message
 * - requestLocation: Function to request location (prompts user)
 */
export const useGeolocation = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle geolocation success
  const handleSuccess = useCallback((position) => {
    const { coords } = position;
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
    setAccuracy(coords.accuracy);
    setTimestamp(new Date().toISOString());
    setError(null);
    setLoading(false);
  }, []);

  // Function to handle geolocation error
  const handleError = useCallback((err) => {
    let errorMessage = 'Unable to retrieve your location';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location services.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        errorMessage = 'The request to get user location timed out.';
        break;
      default:
        errorMessage = `An error occurred: ${err.message}`;
    }
    
    setError(errorMessage);
    setLoading(false);
  }, []);

  // Function to request location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, [handleSuccess, handleError]);

  // Watch location (optional - for tracking)
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return null;
    }

    setLoading(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return watchId;
  }, [handleSuccess, handleError]);

  // Clear watch
  const clearWatch = useCallback((watchId) => {
    if (watchId !== null && watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Auto-request location on mount (optional)
  useEffect(() => {
    // Commented out - user should call requestLocation manually
    // requestLocation();
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    timestamp,
    loading,
    error,
    requestLocation,
    watchLocation,
    clearWatch,
    hasLocation: latitude !== null && longitude !== null
  };
};

export default useGeolocation;