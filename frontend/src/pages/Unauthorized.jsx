import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { FiHome, FiShieldOff } from "react-icons/fi";
import styles from "./styles/Unauthorized.module.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className={styles.container}>
        <Card padding="lg" shadow="md" className={styles.card}>
          <div className={styles.iconWrapper}>
            <FiShieldOff size={72} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Access Denied (403)</h1>
          <p className={styles.message}>
            You do not have the necessary permissions to view this page.
          </p>
          <div className={styles.actions}>
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

export default Unauthorized;
