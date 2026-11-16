import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('minifigma_active_doc')
    } catch {
      // ignore
    }
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen bg-[#1E1E1E] text-white flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#2C2C2C] border border-[#383838] rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-[#9E9E9E] mb-6">
              An unexpected error occurred while rendering the workspace.
            </p>

            {this.state.error && (
              <div className="bg-[#181818] border border-[#303030] rounded-lg p-3 text-left mb-6 overflow-auto max-h-36">
                <code className="text-xs text-red-300 font-mono break-words">
                  {this.state.error.message || 'Unknown error'}
                </code>
              </div>
            )}

            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#383838] hover:bg-[#444444] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D99FF] hover:bg-[#0C8CE9] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
