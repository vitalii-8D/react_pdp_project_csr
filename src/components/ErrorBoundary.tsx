import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  // Clears a caught error when it changes (e.g. the current path), so navigating away recovers.
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// CSR counterpart of the framework app's route-level `ErrorBoundary` export: catches render errors
// below the layout so the header/footer stay usable. Error boundaries still have to be class
// components - there is no hook equivalent of getDerivedStateFromError / componentDidCatch.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    const details = import.meta.env.DEV ? error.message : 'An unexpected error occurred. Please try again.';

    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Something went wrong</h1>
        <p className="text-slate-500 mt-2">{details}</p>
      </div>
    );
  }
}
