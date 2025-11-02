import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGeolocation } from "../hooks/useGeolocation";
import {
  fetchNearbyCommunities,
  resetLocationStatus,
} from "../store/slices/locationSlice";
import Layout from "../components/common/Layout";
import CommunityList from "../components/community/CommunityList";
import { Loader } from "../components/common/Loader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { FiMapPin } from "react-icons/fi";
import styles from "./styles/LocationPages.module.css";

const NearbyCommunities = () => {
  const dispatch = useDispatch();
  const {
    latitude,
    longitude,
    error: geoError,
    requestLocation,
  } = useGeolocation();
  const {
    nearbyCommunities,
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
      dispatch(fetchNearbyCommunities({ latitude, longitude, radiusKm: 25 }));
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
            <h3 className={styles.promptTitle}>Find Communities Near You</h3>
            <p className={styles.promptText}>
              Allow location access to discover local communities.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={FiMapPin}
              onClick={handleFetch}
            >
              Find Nearby Communities
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
              geoError ? "Waiting for location..." : "Finding communities..."
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
      <>
        <h3 className={styles.resultsHeader}>
          Communities Near You (within 25km)
        </h3>
        <CommunityList
          communities={nearbyCommunities}
          isLoading={false}
          error={null}
          emptyMessage="No communities found within 25km of your location."
        />
      </>
    );
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Nearby Communities</h1>
            <p className={styles.subtitle}>Connect with groups in your area</p>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default NearbyCommunities;
