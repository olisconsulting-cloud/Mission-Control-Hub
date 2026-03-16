'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry or other error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
    
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, showDetails: false })
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[200px] rounded-xl bg-surface-900 border border-red-500/30 p-8">
            <div className="text-center max-w-md">
              <p className="text-3xl mb-4">⚠️</p>
              <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted text-sm mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-volt-500 text-void font-semibold rounded-lg hover:bg-volt-400 transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={this.toggleDetails}
                  className="px-4 py-2 border border-surface-700 text-muted hover:text-foreground rounded-lg transition-colors text-sm"
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>

              {this.state.showDetails && this.state.error && (
                <details className="text-left mt-4 p-3 bg-void rounded-lg border border-surface-700">
                  <summary className="cursor-pointer text-xs text-muted mb-2 font-mono">
                    Error Stack
                  </summary>
                  <pre className="text-xs text-red-400 overflow-x-auto whitespace-pre-wrap font-mono">
                    {this.state.error.stack || this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
