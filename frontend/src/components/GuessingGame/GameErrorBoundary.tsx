/**
 * GameErrorBoundary.tsx
 * Error boundary component for graceful error handling in The Guessing Game
 */

import React, { Component, ReactNode } from "react";
import "./GameErrorBoundary.scss";

interface ErrorBoundaryProps {
  children: ReactNode;
  on_reset?: () => void;
}

interface ErrorBoundaryState {
  has_error: boolean;
  error?: Error;
}

/**
 * Error Boundary for The Guessing Game
 * Catches and displays errors gracefully without crashing the entire app
 */
export class GameErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { has_error: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { has_error: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Game Error:", error, errorInfo);
  }

  handle_reset = () => {
    this.setState({ has_error: false, error: undefined });
    if (this.props.on_reset) {
      this.props.on_reset();
    }
  };

  render() {
    if (this.state.has_error) {
      return (
        <div className="game-error-boundary">
          <div className="game-error-boundary__container">
            <div className="game-error-boundary__icon">⚠️</div>
            <h2 className="game-error-boundary__title">
              Oops! Something went wrong
            </h2>
            <p className="game-error-boundary__message">
              The game encountered an unexpected error. Don't worry, you can try
              again!
            </p>
            {this.state.error && (
              <details className="game-error-boundary__details">
                <summary>Error details</summary>
                <pre className="game-error-boundary__error-text">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              className="game-error-boundary__button"
              onClick={this.handle_reset}
            >
              🔄 Return to Game Selection
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
