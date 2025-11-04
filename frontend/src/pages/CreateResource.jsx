import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import ResourceForm from "../components/resource/ResourceForm";
import { Button } from "../components/common/Button";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./styles/CreateResource.module.css";

const CreateResource = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Toast is handled in the slice/form
    navigate("/resources"); // Redirect to resources page on success
  };

  return (
    <Layout>
      <div className={styles.container}>
        <Button
          variant="ghost"
          size="sm"
          icon={FiArrowLeft}
          onClick={() => navigate("/resources")}
          className={styles.backButton}
        >
          Back to Resources
        </Button>

        <ResourceForm
          onSuccess={handleSuccess}
          onClose={() => navigate("/resources")}
        />
      </div>
    </Layout>
  );
};

export default CreateResource;
