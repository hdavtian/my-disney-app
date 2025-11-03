import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Logo Section */}
          <div className="footer__brand">
            <motion.div className="footer__logo" whileHover={{ scale: 1.05 }}>
              Disney App
            </motion.div>
            <p className="footer__tagline">
              Where dreams come true, one story at a time.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer__links">
            <div className="footer__column">
              <h4 className="footer__heading">Explore</h4>
              <ul className="footer__list">
                <li>
                  <a href="/characters">Characters</a>
                </li>
                <li>
                  <a href="/movies">Movies</a>
                </li>
                <li>
                  <a href="/favorites">Favorites</a>
                </li>
                <li>
                  <a href="/behind-the-magic">Behind the Magic</a>
                </li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__heading">Company</h4>
              <ul className="footer__list">
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/careers">Careers</a>
                </li>
                <li>
                  <a href="/press">Press</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__heading">Support</h4>
              <ul className="footer__list">
                <li>
                  <a href="/help">Help Center</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
                <li>
                  <a href="/accessibility">Accessibility</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            <p>&copy; 2025 Disney App. All rights reserved.</p>
          </div>

          <div className="footer__social">
            <motion.a
              href="#"
              className="footer__social-link"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Follow us on Facebook"
            >
              📘
            </motion.a>
            <motion.a
              href="#"
              className="footer__social-link"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Follow us on Twitter"
            >
              🐦
            </motion.a>
            <motion.a
              href="#"
              className="footer__social-link"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Follow us on Instagram"
            >
              📷
            </motion.a>
            <motion.a
              href="#"
              className="footer__social-link"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Subscribe to our YouTube channel"
            >
              📺
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};
