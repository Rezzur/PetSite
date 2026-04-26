import { Component, type ErrorInfo, type ReactNode } from 'react';

type LanyardErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type LanyardErrorBoundaryState = {
  failed: boolean;
};

export default class LanyardErrorBoundary extends Component<LanyardErrorBoundaryProps, LanyardErrorBoundaryState> {
  state: LanyardErrorBoundaryState = {
    failed: false
  };

  static getDerivedStateFromError(): LanyardErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lanyard scene failed to render', error, info);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
