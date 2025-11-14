import "./AboutPage.scss";
import { motion } from "framer-motion";

export const AboutPage = () => {
  return (
    <motion.div
      className="page-container about-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>About this Demo</h1>
        <p>
          A modern Disney character catalog showcasing clean architecture and
          cinematic design.
        </p>
      </div>

      <div className="about-content">
        <div className="content-section">
          <h2>Welcome to the Disney App Demo</h2>
          <p>
            This project combines strong engineering with cinematic design to
            create an immersive Disney character browsing experience.
          </p>
          <p>
            Built with React 19, Spring Boot, and PostgreSQL, featuring 8 unique
            themes, advanced filtering, and a character quiz game.
          </p>
        </div>

        <div className="content-section">
          <h3>Coming Soon</h3>
          <p>
            Additional content including project walkthroughs and technical
            deep-dives will be added here.
          </p>
          {/* Future: YouTube video embeds and project links will go here */}
        </div>
      </div>
    </motion.div>
  );
};
