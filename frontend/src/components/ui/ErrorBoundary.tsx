"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center px-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-sm text-gray-500 max-w-sm">{this.state.message}</p>
            <Button onClick={() => this.setState({ hasError: false, message: "" })}>
              Try Again
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
