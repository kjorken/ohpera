import { Component, type ReactNode, type ErrorInfo } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <span className="text-2xl" aria-hidden="true">!</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or go back to the dashboard.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ube px-5 text-sm font-medium text-white shadow-sm shadow-ube/15 transition-all hover:bg-ube-light hover:shadow-md"
            >
              Try again
            </button>

            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
