import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-auto">
      <div className="relative min-h-screen text-white">
        {/* Background Video with Overlay */}
        <div className="fixed inset-0 z-0">
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
            <source src="/rave-video.webm" type="video/webm" />
          </video>
          {/* Subtle gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
          <div className="text-center space-y-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                  One search. All the best electronic music events. Anywhere.
                </span>
              </h1>

              {/* CTA Button */}
              <div className="mt-8">
                <Link
                  href="/find-events"
                  className="inline-block px-12 py-4 border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full font-medium transition-all duration-300 text-xl"
                >
                  Explore Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
