import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./DisclaimerPage.module.scss";
import {
  acceptDisclaimer,
  isDisclaimerAccepted,
  clearDisclaimer,
} from "../../utils/disclaimerGate";

export const DisclaimerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize from storage synchronously to avoid UI flash of buttons
  const [accepted, setAccepted] = useState<boolean>(() =>
    isDisclaimerAccepted()
  );

  const handleAccept = () => {
    acceptDisclaimer();
    setAccepted(true);
    const params = new URLSearchParams(location.search);
    const target = params.get("redirect") || "/";
    navigate(target, { replace: true });
  };

  // Page remains visible even after acceptance; we just hide actions.

  return (
    <div
      className={styles.disclaimerPage}
      role="dialog"
      aria-labelledby="disclaimerTitle"
      aria-modal="true"
    >
      <h1 id="disclaimerTitle" className={styles.title}>
        Disclaimer
      </h1>
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

        {!accepted && (
          <>
            <p>
              By clicking <strong>Accept & Continue</strong>, you acknowledge
              this is a non-commercial demo and agree not to treat its content
              as official or authoritative.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleAccept}
                className={styles.button}
                aria-label="Accept disclaimer and continue"
              >
                Accept & Continue
              </button>
              <a
                href="https://www.google.com"
                className={styles.button}
                aria-label="Decline and leave this site"
                rel="nofollow noopener"
              >
                Decline
              </a>
            </div>
          </>
        )}
        {import.meta.env.DEV && (
          <div className={styles.devControls}>
            <button
              type="button"
              className={styles.devButton}
              onClick={() => {
                clearDisclaimer();
                setAccepted(false);
                // Clear redirect noise and keep user on disclaimer to re-test
                if (location.search) {
                  navigate("/disclaimer", { replace: true });
                }
              }}
            >
              Reset disclaimer (dev)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
