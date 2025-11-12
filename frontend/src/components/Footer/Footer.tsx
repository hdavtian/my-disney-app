import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.leftColumn}>
          <span>
            A demo project by{" "}
            <strong className="color-disney-gold">Harma Davtian</strong>, 2025 |{" "}
          </span>
          <Link to="/disclaimer" className={styles.disclaimerLink}>
            Disclaimer
          </Link>
        </div>
        <div className={styles.rightColumn}>
          Harma Davtian:&nbsp;
          <a
            href="https://harmadavtian.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio
          </a>
          <span className={styles.separator}>|</span>
          <a
            href="https://www.linkedin.com/in/harma-davtian/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <span className={styles.separator}>|</span>
          <a
            href="https://github.com/hdavtian/my-disney-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Project Github
          </a>
          <span className={styles.separator}>|</span>
          <a
            href="https://codepen.io/hdavtian"
            target="_blank"
            rel="noopener noreferrer"
          >
            CodePen
          </a>
        </div>
      </div>
    </footer>
  );
};
