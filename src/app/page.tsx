import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      <div className="h-full text-white">
        {/* Background Video with Overlay */}
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
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
              Discover Your Next Rave
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Find the best raves and music events near you. Let the beat guide
              you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link href="/find-events">
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium hover-effect">
                  Find Events
                </button>
              </Link>
              <Link href="/create-event">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-medium hover-effect">
                  Create an Event
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
