import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeaturedResources } from "../../store/slices/resourceSlice";
import ResourceCard from "./ResourceCard";
import { Loader } from "../common/Loader";
import styles from "./styles/FeaturedResources.module.css";

const FeaturedResources = () => {
  const dispatch = useDispatch();
  const { featured, status } = useSelector((state) => state.resources);
  const isLoading = status === "loading";

  useEffect(() => {
    // Only fetch if featured is empty
    if (featured.length === 0) {
      dispatch(fetchFeaturedResources());
    }
  }, [dispatch, featured.length]);

  if (isLoading && featured.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="sm" text="Loading featured..." />
      </div>
    );
  }

  if (featured.length === 0) {
    return null; // Don't show anything if no featured resources
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Featured Resources</h2>
      <div className={styles.grid}>
        {featured.map((resource) => (
          <ResourceCard key={resource._id} resource={resource} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedResources;
