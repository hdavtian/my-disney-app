import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  isDisclaimerAccepted,
  buildRedirectParam,
} from "../../utils/disclaimerGate";

/**
 * Route guard that ensures the disclaimer is accepted before accessing protected routes.
 * Allows the /disclaimer route itself to render.
 */
export const RequireDisclaimer: React.FC = () => {
  const location = useLocation();

  // Allow the disclaimer route itself without checks
  if (location.pathname === "/disclaimer") {
    return <Outlet />;
  }

  if (isDisclaimerAccepted()) {
    return <Outlet />;
  }

  const redirect = buildRedirectParam(location.pathname, location.search);
  return <Navigate to={`/disclaimer?redirect=${redirect}`} replace />;
};
