import React from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram, FiMail } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Footer Content */}
        <div style={styles.content}>
          {/* About Section */}
          <div style={styles.section}>
            <h4 style={styles.title}>About ImpactHub</h4>
            <p style={styles.text}>
              ImpactHub is a community-driven platform empowering volunteers to
              create positive environmental and social impact through organized
              events and activities.
            </p>
          </div>

          {/* Quick Links */}
          <div style={styles.section}>
            <h4 style={styles.title}>Quick Links</h4>
            <ul style={styles.list}>
              <li>
                <Link to="/events" style={styles.link}>
                  Events
                </Link>
              </li>
              <li>
                <Link to="/communities" style={styles.link}>
                  Communities
                </Link>
              </li>
              <li>
                <Link to="/impact" style={styles.link}>
                  Impact
                </Link>
              </li>
              <li>
                <Link to="/resources" style={styles.link}>
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div style={styles.section}>
            <h4 style={styles.title}>Resources</h4>
            <ul style={styles.list}>
              <li>
                <Link to="/faq" style={styles.link}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" style={styles.link}>
                  Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" style={styles.link}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div style={styles.section}>
            <h4 style={styles.title}>Get in Touch</h4>
            <p style={styles.text}>
              Have questions? We'd love to hear from you.
            </p>
            <div style={styles.social}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                <FiInstagram size={20} />
              </a>
              <a href="mailto:contact@impacthub.com" style={styles.socialLink}>
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom Bar */}
        <div style={styles.bottom}>
          <p style={styles.copyright}>
            &copy; {currentYear} ImpactHub. All rights reserved.
          </p>
          <div style={styles.bottomLinks}>
            <Link to="/privacy" style={styles.bottomLink}>
              Privacy
            </Link>
            <span style={styles.separator}>•</span>
            <Link to="/terms" style={styles.bottomLink}>
              Terms
            </Link>
            <span style={styles.separator}>•</span>
            <a href="mailto:contact@impacthub.com" style={styles.bottomLink}>
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#004D40",
    color: "#FAFAFA",
    marginTop: "auto",
    paddingTop: "60px",
    paddingBottom: "20px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "40px",
    marginBottom: "40px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#FFB300",
    marginBottom: "15px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  text: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "rgba(250,250,250,0.8)",
    margin: 0,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  link: {
    color: "rgba(250,250,250,0.8)",
    textDecoration: "none",
    fontSize: "13px",
    lineHeight: "1.8",
    transition: "color 0.2s ease",
  },
  social: {
    display: "flex",
    gap: "15px",
    marginTop: "15px",
  },
  socialLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: "rgba(255,179,0,0.1)",
    borderRadius: "50%",
    color: "#FFB300",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(250,250,250,0.1)",
    marginBottom: "20px",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  copyright: {
    fontSize: "12px",
    color: "rgba(250,250,250,0.6)",
    margin: 0,
  },
  bottomLinks: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  bottomLink: {
    color: "rgba(250,250,250,0.6)",
    textDecoration: "none",
    fontSize: "12px",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  separator: {
    color: "rgba(250,250,250,0.3)",
  },
};

export default Footer;
