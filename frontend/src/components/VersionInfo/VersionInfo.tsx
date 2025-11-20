import React, { useEffect, useState } from "react";
import { getVersionInfo } from "../../config/version";
import "./VersionInfo.scss";

interface ApiVersion {
  version: string;
  gitCommit: string;
  buildTime: string;
  environment: string;
}

export const VersionInfo: React.FC = () => {
  const frontendVersion = getVersionInfo();
  const [apiVersion, setApiVersion] = useState<ApiVersion | null>(null);
  const [loading, setLoading] = useState(true);

  const frontendCommit =
    frontendVersion.gitCommit === "unknown"
      ? "local"
      : frontendVersion.gitCommit.substring(0, 7);

  useEffect(() => {
    // Fetch backend version info
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
      }/api/version`
    )
      .then((res) => res.json())
      .then((data) => {
        setApiVersion(data);
        setLoading(false);
      })
      .catch(() => {
        setApiVersion(null);
        setLoading(false);
      });
  }, []);

  const apiCommit = loading
    ? "loading..."
    : apiVersion?.gitCommit === "unknown"
    ? "local"
    : apiVersion?.gitCommit?.substring(0, 7) || "error";

  const environment =
    apiVersion?.environment === "unknown"
      ? frontendVersion.environment
      : apiVersion?.environment || frontendVersion.environment;

  return (
    <div className="version-info">
      <span className="version-info__label">Frontend:</span>
      <span className="version-info__item">v{frontendVersion.version}</span>
      <span className="version-info__separator">•</span>
      <span className="version-info__item">{frontendCommit}</span>
      <span className="version-info__separator">•</span>
      <span className="version-info__label">API:</span>
      <span className="version-info__item">{apiCommit}</span>
      <span className="version-info__separator">•</span>
      <span className="version-info__item">{environment}</span>
    </div>
  );
};
