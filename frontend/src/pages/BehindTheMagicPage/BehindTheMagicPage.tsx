
import "./BehindTheMagicPage.scss";
import { motion } from "framer-motion";

export const BehindTheMagicPage = () => {
  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>Behind the Magic</h1>
        <p>
          Discover the artistry, creativity, and stories behind Disney's most
          beloved creations.
        </p>
      </div>

      <div className="behind-magic-content">
        <div className="empty-state">
          <h3>Magic in Progress!</h3>
          <p>
            We're gathering exclusive behind-the-scenes content and concept art
            for you.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
