import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGeolocation } from "../hooks/useGeolocation";
import {
  fetchNearbyEvents,
  resetLocationStatus,
} from "../store/slices/locationSlice";
import Layout from "../components/common/Layout";
import EventList from "../components/event/EventList";
import { Loader } from "../components/common/Loader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { FiMapPin, FiAlertCircle } from "react-icons/fi";
import styles from "./styles/LocationPages.module.css";

const NearbyEvents = () => {
  const dispatch = useDispatch();
  const {
    latitude,
    longitude,
    error: geoError,
    requestLocation,
  } = useGeolocation();
  const {
    nearbyEvents,
    status,
    error: apiError,
  } = useSelector((state) => state.location);
  const [hasRequested, setHasRequested] = useState(false);

  const handleFetch = () => {
    setHasRequested(true);
    dispatch(resetLocationStatus());
    requestLocation();
  };

  useEffect(() => {
    if (latitude && longitude && hasRequested && status === "idle") {
      dispatch(fetchNearbyEvents({ latitude, longitude, radiusKm: 25 }));
    }
  }, [latitude, longitude, hasRequested, status, dispatch]);

  const isLoading = status === "loading";
  const error = apiError || geoError;

  const renderContent = () => {
    if (!hasRequested) {
      return (
        <Card padding="lg" shadow="md">
          <div className={styles.promptContainer}>
            <div className={styles.promptIcon}>📍</div>
            <h3 className={styles.promptTitle}>Find Events Near You</h3>
            <p className={styles.promptText}>
              Allow location access to discover volunteer opportunities in your
              area.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={FiMapPin}
              onClick={handleFetch}
            >
              Find Nearby Events
            </Button>
          </div>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Loader
            size="lg"
            text={geoError ? "Waiting for location..." : "Finding events..."}
          />
        </div>
      );
    }

    if (error) {
      return (
        <Card padding="lg" shadow="md">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorText}>{error}</p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFetch}
              style={{ marginTop: "16px" }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <>
        <h3 className={styles.resultsHeader}>Events Near You (within 25km)</h3>
        <EventList
          events={nearbyEvents}
          isLoading={false}
          error={null}
          emptyMessage="No upcoming events found within 25km of your location."
        />
      </>
    );
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Nearby Events</h1>
            <p className={styles.subtitle}>
              Discover what's happening around you
            </p>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default NearbyEvents;
