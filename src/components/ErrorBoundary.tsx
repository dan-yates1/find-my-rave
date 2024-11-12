'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Add custom error page component
const CustomErrorPage = ({ 
  statusCode = 500,
  title = "Something went wrong",
  message = "An unexpected error occurred",
  showHomeButton = true
}: {
  statusCode?: number;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}) => (
  <div className="h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden fixed inset-0">
    {/* Video Background with Overlay */}
    <div className="absolute inset-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        poster="/video-fallback.jpg"
        disablePictureInPicture
        disableRemotePlayback
      >
        <source src="/rave-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50" />
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
      <h1 className="text-8xl font-bold text-white">{statusCode}</h1>
      <h2 className="text-3xl font-semibold text-white">{title}</h2>
      <p className="text-gray-200">{message}</p>
      {showHomeButton && (
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Return Home
        </a>
      )}
    </div>
  </div>
);

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <CustomErrorPage 
          statusCode={500}
          title="Something went wrong"
          message="An unexpected error occurred. Please try again later."
        />
      );
    }

    return this.props.children;
  }
}

// Export CustomErrorPage for use in other error pages
export { CustomErrorPage }; 