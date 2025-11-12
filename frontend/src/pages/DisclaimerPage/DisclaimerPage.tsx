import React from "react";
import styles from "./DisclaimerPage.module.scss";

export const DisclaimerPage: React.FC = () => {
  return (
    <div className={styles.disclaimerPage}>
      <h1 className={styles.title}>Disclaimer</h1>
      <div className={styles.content}>
        <p>
          This website is a demonstration project created for educational and
          portfolio purposes to showcase web development skills using various
          technologies.
        </p>
        <p>
          The content, including but not limited to text, images, logos, and
          other assets, is used for demonstration purposes only. All trademarks,
          logos, and images are the property of their respective owners. No
          claim of ownership or credit is made for any third-party content used
          in this demo.
        </p>
        <p>
          This demonstration project is not intended for public use and will be
          accessible only through a private login system. It is not affiliated
          with, endorsed by, or connected to any of the entities whose content
          may be displayed.
        </p>
      </div>
    </div>
  );
};
