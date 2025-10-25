import { Component, type ErrorInfo, type ReactNode } from "react";

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent: React.ComponentType<FallbackProps>;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route error boundary captured an error", error, info);
  }

  private resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, FallbackComponent } = this.props;

    if (error) {
      return <FallbackComponent error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return children;
  }
}

export { ErrorBoundary };
