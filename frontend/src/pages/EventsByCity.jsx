import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventsByCity } from "../store/slices/locationSlice";
import Layout from "../components/common/Layout";
import EventList from "../components/event/EventList";
import { Loader } from "../components/common/Loader";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./styles/LocationPages.module.css";

const EventsByCity = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    cityEvents: events,
    status,
    error,
  } = useSelector((state) => state.location);

  useEffect(() => {
    if (!cityName) {
      return;
    }
    dispatch(fetchEventsByCity(cityName));
  }, [cityName, dispatch]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className={styles.loadingContainer}>
          <Loader size="lg" text={`Finding events in ${cityName}...`} />
        </div>
      );
    }

    if (error) {
      return (
        <Card padding="lg" shadow="md">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorText}>{error}</p>
          </div>
        </Card>
      );
    }

    return (
      <EventList
        events={events}
        isLoading={false}
        error={null}
        emptyMessage={`No upcoming events found in ${cityName}.`}
      />
    );
  };

  return (
    <Layout>
      <div className={styles.container}>
        <Button
          size="sm"
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate("/events")}
          style={{ marginBottom: "20px" }}
        >
          Back to All Events
        </Button>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Events in {cityName}</h1>
            <p className={styles.subtitle}>Browse opportunities in this city</p>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default EventsByCity;
