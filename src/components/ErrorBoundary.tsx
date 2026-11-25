import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Cat } from './Cat';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level error boundary that catches Firestore permission/quota errors
 * or unexpected render issues and gives the user a calm recovery screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Toodles ErrorBoundary caught error:', error, info.componentStack);
  }

  private getFriendlyMessage(error: Error): string {
    const raw = error.message;
    if (raw.includes('Quota exceeded')) {
      return 'Your daily cloud database quota has been reached. Quota resets automatically tomorrow.';
    }
    if (raw.includes('Missing or insufficient permissions') || raw.includes('permission-denied')) {
      return 'We could not verify access to your cloud workspace. Try signing in again or reloading.';
    }
    if (raw.includes('client is offline')) {
      return 'It looks like you are offline right now. Check your connection and try again.';
    }
    return 'Something unexpected tripped Toodles up. Reloading usually clears things right up.';
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-dvh flex items-center justify-center bg-lilac-50 p-6 text-ink">
        <div className="w-full max-w-md paper-stack rounded-[5px] border border-lilac-200 p-7 text-center space-y-4">
          <div className="flex justify-center">
            <Cat pose="curious" size={92} animated={false} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">A little hiccup</h1>
          <p className="font-sans text-sm italic text-ink-soft leading-relaxed">
            {this.getFriendlyMessage(error)}
          </p>
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Reload Toodles
            </Button>
            <Button variant="ghost" onClick={() => this.setState({ error: null })}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
