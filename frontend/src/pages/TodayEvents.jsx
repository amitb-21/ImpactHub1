import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGeolocation } from "../hooks/useGeolocation";
import { fetchTodayNearby } from "../store/slices/locationSlice";
import Layout from "../components/common/Layout";
import EventList from "../components/event/EventList";
import { Loader } from "../components/common/Loader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { FiMapPin } from "react-icons/fi";
import styles from "./styles/LocationPages.module.css";

const TodayEvents = () => {
  const {
    latitude,
    longitude,
    error: geoError,
    requestLocation,
  } = useGeolocation();
  const dispatch = useDispatch();
  const {
    todayEvents,
    status,
    error: apiError,
  } = useSelector((state) => state.location);
  const [hasRequested, setHasRequested] = useState(false);

  const handleFetch = () => {
    setHasRequested(true);
    requestLocation();
  };

  useEffect(() => {
    if (latitude && longitude && hasRequested) {
      dispatch(fetchTodayNearby({ latitude, longitude, radiusKm: 25 }));
    }
  }, [latitude, longitude, hasRequested, dispatch]);

  const isLoading =
    status === "loading" ||
    (hasRequested &&
      !geoError &&
      !apiError &&
      !todayEvents.length &&
      !latitude);
  const error = apiError || geoError;

  const renderContent = () => {
    if (!hasRequested) {
      return (
        <Card padding="lg" shadow="md">
          <div className={styles.promptContainer}>
            <div className={styles.promptIcon}>📅</div>
            <h3 className={styles.promptTitle}>Find Today's Events Near You</h3>
            <p className={styles.promptText}>
              Allow location access to see what's happening today.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={FiMapPin}
              onClick={handleFetch}
            >
              Find Today's Events
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
            text={
              geoError ? "Waiting for location..." : "Finding today's events..."
            }
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
      <EventList
        events={events}
        isLoading={false}
        error={null}
        emptyMessage="No events found happening today near you."
      />
    );
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Today's Events</h1>
            <p className={styles.subtitle}>
              See what's happening near you right now
            </p>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default TodayEvents;
