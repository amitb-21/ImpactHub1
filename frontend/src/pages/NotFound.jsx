import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import styles from "./styles/NotFound.module.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className={styles.container}>
        <Card padding="lg" shadow="md" className={styles.card}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>404</span>
          </div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.message}>
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
          <div className={styles.actions}>
            <Button
              variant="outline"
              size="md"
              icon={FiArrowLeft}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={FiHome}
              onClick={() => navigate("/")}
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFound;
