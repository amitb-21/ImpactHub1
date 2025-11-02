import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { locationAPI } from "../api/services";
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!cityName) {
        setError("No city provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await locationAPI.getEventsByCity(cityName);
        setEvents(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName]);

  const renderContent = () => {
    if (loading) {
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
