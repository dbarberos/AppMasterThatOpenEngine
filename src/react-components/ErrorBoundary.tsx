import * as React from 'react';

interface ErrorBoundaryProps {
    fallback: React.ReactNode; 
    children: React.ReactNode; 
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true }
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            
            return this.props.fallback 
            //return (
                // <div>
                //     <h1>Something went wrong.</h1>
                //       <p>Please try again later.</p>
                // </div>
            //);  
        }
        return this.props.children;
    }
}

export default ErrorBoundary;