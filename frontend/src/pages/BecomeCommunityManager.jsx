import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyApplication,
  clearError,
  clearSuccessMessage,
} from "../store/slices/communityManagerSlice";
import Layout from "../components/common/Layout";
import CMApplicationForm from "../components/communityManager/CMApplicationForm";
import CMApplicationStatus from "../components/communityManager/CMApplicationStatus";
import CMApplicationHistory from "../components/communityManager/CMApplicationHistory";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { FiArrowLeft, FiPlus, FiChevronDown, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./styles/BecomeCommunityManager.module.css";

const BecomeCommunityManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myApplication, successMessage, error } = useSelector(
    (state) => state.communityManager
  );
  const [view, setView] = useState("status");
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

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
        if (error) dispatch(clearError());
        if (successMessage) dispatch(clearSuccessMessage());
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
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Scroll to form when showForm changes
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm]);

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <Button
              size="sm"
              variant="ghost"
              icon={FiArrowLeft}
              onClick={() => navigate("/communities")}
              className={styles.backButton}
            >
              Back
            </Button>
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Become a Community Manager</h1>
            <p className={styles.subtitle}>
              Lead communities and make a greater impact in your region
            </p>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className={`${styles.message} ${styles.messageSuccess}`}>
            <span className={styles.messageIcon}>✅</span>
            <span className={styles.messageText}>{successMessage}</span>
            <button
              className={styles.messageClose}
              onClick={() => dispatch(clearSuccessMessage())}
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.messageError}`}>
            <span className={styles.messageIcon}>❌</span>
            <span className={styles.messageText}>{error}</span>
            <button
              className={styles.messageClose}
              onClick={() => dispatch(clearError())}
            >
              ✕
            </button>
          </div>
        )}

        {/* Info Card - What is a Community Manager */}
        <Card padding="lg" shadow="md" className={styles.infoCard}>
          <h2 className={styles.infoTitle}>What is a Community Manager?</h2>
          <p className={styles.infoSubtitle}>
            Community managers are the backbone of ImpactHub. They lead,
            organize, and inspire volunteer communities around shared causes.
          </p>
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
              title="Earn Rewards"
              description="Earn extra points and rewards for managing active communities"
            />
            <BenefitItem
              icon="🏆"
              title="Build Reputation"
              description="Establish yourself as a recognized leader in your region"
            />
          </div>
        </Card>

        {/* Main Content Section */}
        <div className={styles.mainContent}>
          {/* Application Status or CTA */}
          {!showForm && myApplication && (
            <section className={styles.statusSection}>
              <CMApplicationStatus
                onReapply={handleReapply}
                onViewCommunity={() => {}}
              />
            </section>
          )}

          {!showForm && !myApplication && (
            <section className={styles.ctaSection}>
              <Card padding="xl" shadow="md" className={styles.ctaCard}>
                <div className={styles.ctaContent}>
                  <div className={styles.ctaIcon}>🚀</div>
                  <h3 className={styles.ctaTitle}>Ready to Get Started?</h3>
                  <p className={styles.ctaText}>
                    Start your journey as a community manager and make a real
                    difference. The application process takes just 10 minutes!
                  </p>
                  <Button
                    size="lg"
                    variant="primary"
                    icon={FiPlus}
                    onClick={() => setShowForm(true)}
                    className={styles.ctaButton}
                  >
                    Start Application
                  </Button>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className={styles.statsGrid}>
                <StatCard number="5000+" label="Active Managers" />
                <StatCard number="1200+" label="Communities" />
                <StatCard number="50K+" label="Volunteers" />
              </div>
            </section>
          )}

          {/* Application Form */}
          {showForm && (
            <section className={styles.formSection} ref={formRef}>
              <Card padding="lg" shadow="md">
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    Community Manager Application
                  </h2>
                  <button
                    className={styles.closeFormButton}
                    onClick={() => setShowForm(false)}
                    aria-label="Close form"
                    title="Close form"
                  >
                    ✕
                  </button>
                </div>
                <CMApplicationForm onSuccess={handleFormSuccess} />
              </Card>
            </section>
          )}

          {/* Application History */}
          {!showForm && (
            <section className={styles.historySection}>
              <CMApplicationHistory />
            </section>
          )}
        </div>

        {/* Requirements Section */}
        <section className={styles.requirementsSection}>
          <Card padding="lg" shadow="md">
            <div className={styles.requirementsHeader}>
              <h3 className={styles.requirementsTitle}>✓ Requirements</h3>
              <p className={styles.requirementsSubtitle}>
                You'll need to meet these criteria to become a community manager
              </p>
            </div>
            <div className={styles.requirementsList}>
              <RequirementItem
                icon={<FiCheck size={20} />}
                title="Active Member"
                description="Minimum 30 days on ImpactHub with regular activity"
              />
              <RequirementItem
                icon={<FiCheck size={20} />}
                title="Event Experience"
                description="Organized at least 1 successful event"
              />
              <RequirementItem
                icon={<FiCheck size={20} />}
                title="Volunteer Record"
                description="Participated in 3+ volunteering activities"
              />
              <RequirementItem
                icon={<FiCheck size={20} />}
                title="Registered Organization"
                description="Organization or group registered for verification"
              />
              <RequirementItem
                icon={<FiCheck size={20} />}
                title="Clear Vision"
                description="Defined community vision and mission"
              />
              <RequirementItem
                icon={<FiCheck size={20} />}
                title="Shared Values"
                description="Commitment to ImpactHub values and guidelines"
              />
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <Card padding="lg" shadow="md">
            <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
            <div className={styles.faqList}>
              <FAQItem
                question="How long does the review process take?"
                answer="We typically review applications within 3-5 business days. You'll receive email notifications of any updates."
              />
              <FAQItem
                question="What happens if my application is rejected?"
                answer="If rejected, we provide detailed feedback. You can reapply after 30 days. We recommend addressing the feedback before reapplying."
              />
              <FAQItem
                question="Can I update my community information?"
                answer="Yes! Once approved, you can update your community details, description, images, and event information anytime from your dashboard."
              />
              <FAQItem
                question="Are there any costs involved?"
                answer="No, it's completely free! Being a community manager comes with exclusive benefits, rewards, and recognition."
              />
              <FAQItem
                question="What if I don't meet the requirements yet?"
                answer="You can start by joining events and participating in communities to build your record. Check back once you meet the criteria!"
              />
            </div>
          </Card>
        </section>

        {/* Support CTA */}
        <section className={styles.supportSection}>
          <Card padding="lg" shadow="md" className={styles.supportCard}>
            <h3 className={styles.supportTitle}>Need Help?</h3>
            <p className={styles.supportText}>
              Have questions about the community manager program? Our support
              team is here to help!
            </p>
            <div className={styles.supportActions}>
              <Button variant="outline" size="md">
                📧 Contact Support
              </Button>
              <Button variant="primary" size="md">
                📚 View Guide
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

// Benefit Item Component
const BenefitItem = ({ icon, title, description }) => (
  <div className={styles.benefitItem}>
    <span className={styles.benefitIcon}>{icon}</span>
    <h4 className={styles.benefitTitle}>{title}</h4>
    <p className={styles.benefitDescription}>{description}</p>
  </div>
);

// Requirement Item Component
const RequirementItem = ({ icon, title, description }) => (
  <div className={styles.requirementItem}>
    <div className={styles.requirementIcon}>{icon}</div>
    <div className={styles.requirementContent}>
      <h4 className={styles.requirementItemTitle}>{title}</h4>
      <p className={styles.requirementItemDescription}>{description}</p>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ number, label }) => (
  <div className={styles.statCard}>
    <div className={styles.statNumber}>{number}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
      <button
        className={styles.faqQuestion}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.faqQuestionText}>{question}</span>
        <FiChevronDown
          size={20}
          className={styles.faqIcon}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
      {isOpen && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  );
};

export default BecomeCommunityManager;
