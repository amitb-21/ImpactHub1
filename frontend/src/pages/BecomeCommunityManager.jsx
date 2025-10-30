import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyApplication,
  clearMessages,
} from "../../store/slices/communityManagerSlice";
import Layout from "../../components/common/Layout";
import CMApplicationForm from "../../components/communityManager/CMApplicationForm";
import CMApplicationStatus from "../../components/communityManager/CMApplicationStatus";
import CMApplicationHistory from "../../components/communityManager/CMApplicationHistory";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./styles/BecomeCommunityManager.module.css";

const BecomeCommunityManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myApplication, successMessage, error } = useSelector(
    (state) => state.communityManager
  );
  const [view, setView] = useState("status"); // 'form', 'status', 'history'
  const [showForm, setShowForm] = useState(false);

  // Fetch current application on mount
  useEffect(() => {
    dispatch(getMyApplication());
  }, [dispatch]);

  // Determine which view to show
  useEffect(() => {
    if (!myApplication) {
      setView("form");
    } else {
      setView("status");
    }
  }, [myApplication]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  // Handle form submission success
  const handleFormSuccess = () => {
    setShowForm(false);
    dispatch(getMyApplication());
  };

  // Handle reapply button
  const handleReapply = () => {
    setShowForm(true);
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <Button
              size="sm"
              variant="ghost"
              icon={FiArrowLeft}
              onClick={() => navigate("/communities")}
            >
              Back
            </Button>
          </div>
          <div>
            <h1 className={styles.title}>Become a Community Manager</h1>
            <p className={styles.subtitle}>
              Lead communities and make a greater impact
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card padding="md" shadow="md" className={styles.successMessage}>
            <div className={styles.messageContent}>
              <span className={styles.messageIcon}>✅</span>
              <span>{successMessage}</span>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card padding="md" shadow="md" className={styles.errorMessage}>
            <div className={styles.messageContent}>
              <span className={styles.messageIcon}>❌</span>
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card padding="lg" shadow="md" className={styles.infoCard}>
          <h2 className={styles.infoTitle}>What is a Community Manager?</h2>
          <div className={styles.infoBenefits}>
            <BenefitItem
              icon="👥"
              title="Lead Communities"
              description="Create and manage communities focused on environmental and social impact"
            />
            <BenefitItem
              icon="🎯"
              title="Organize Events"
              description="Plan and coordinate volunteer events for your community members"
            />
            <BenefitItem
              icon="⭐"
              title="Earn Points"
              description="Earn extra points and rewards for managing active communities"
            />
            <BenefitItem
              icon="🏆"
              title="Build Reputation"
              description="Establish yourself as a leader in environmental activism"
            />
          </div>
        </Card>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Show Form if applying */}
          {showForm && (
            <div className={styles.formSection}>
              <Card padding="lg" shadow="md">
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    Community Manager Application
                  </h2>
                  <button
                    className={styles.closeFormButton}
                    onClick={() => setShowForm(false)}
                    aria-label="Close form"
                  >
                    ✕
                  </button>
                </div>
                <CMApplicationForm onSuccess={handleFormSuccess} />
              </Card>
            </div>
          )}

          {/* Show Status if not applying and has application */}
          {!showForm && myApplication && (
            <div className={styles.statusSection}>
              <CMApplicationStatus
                onReapply={handleReapply}
                onViewCommunity={() => {
                  // Navigate to community
                }}
              />
            </div>
          )}

          {/* Show CTA if no application */}
          {!showForm && !myApplication && (
            <Card padding="lg" shadow="md" className={styles.ctaCard}>
              <div className={styles.ctaContent}>
                <div className={styles.ctaIcon}>🚀</div>
                <h3 className={styles.ctaTitle}>Ready to Get Started?</h3>
                <p className={styles.ctaText}>
                  Start your journey as a community manager and make a real
                  difference in your community. The application process takes
                  just 10 minutes!
                </p>
                <Button
                  size="lg"
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => setShowForm(true)}
                >
                  Start Application
                </Button>
              </div>
            </Card>
          )}

          {/* Show History */}
          {!showForm && (
            <div className={styles.historySection}>
              <CMApplicationHistory />
            </div>
          )}
        </div>

        {/* Requirements Card */}
        <Card padding="lg" shadow="md" className={styles.requirementsCard}>
          <h3 className={styles.requirementsTitle}>Requirements</h3>
          <ul className={styles.requirementsList}>
            <li>✓ Active member of ImpactHub (minimum 30 days)</li>
            <li>✓ Organized at least 1 successful event</li>
            <li>✓ Participated in 3+ volunteering activities</li>
            <li>✓ Registered organization or group (for verification)</li>
            <li>✓ Clear community vision and mission</li>
            <li>✓ Commitment to ImpactHub values and guidelines</li>
          </ul>
        </Card>

        {/* FAQ Card */}
        <Card padding="lg" shadow="md" className={styles.faqCard}>
          <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
          <div className={styles.faqList}>
            <FAQItem
              question="How long does the review process take?"
              answer="We typically review applications within 3-5 business days. You'll receive email notifications of any updates."
            />
            <FAQItem
              question="What happens if my application is rejected?"
              answer="If rejected, we provide detailed feedback. You can reapply after 30 days. We recommend addressing the feedback."
            />
            <FAQItem
              question="Can I update my community information later?"
              answer="Yes! Once approved, you can update your community details, description, and images anytime."
            />
            <FAQItem
              question="Are there any costs to becoming a manager?"
              answer="No, it's completely free! Being a community manager comes with exclusive benefits and rewards."
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

// Benefit Item Component
const BenefitItem = ({ icon, title, description }) => (
  <div className="benefit-item">
    <span className="benefit-icon">{icon}</span>
    <h4 className="benefit-title">{title}</h4>
    <p className="benefit-description">{description}</p>
  </div>
);

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <span className="faq-icon">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <p className="faq-answer">{answer}</p>}
    </div>
  );
};

export default BecomeCommunityManager;
