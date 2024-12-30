export default function NotFound() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
        poster="/video-fallback.jpg"
        disablePictureInPicture
        disableRemotePlayback
      >
        <source src="/rave-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center space-y-6 max-w-4xl mx-auto text-white">
          <h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
            404
          </h1>
          <h2 className="text-3xl font-semibold">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a 
            href="/"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors duration-200"
          >
            Return Home
          </a>
        </div>
      </div>
    </main>
  );
} 