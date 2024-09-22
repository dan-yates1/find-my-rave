import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative text-white overflow-hidden"
      style={{
        backgroundImage: "url('/video-fallback.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 filter">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/rave-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          Discover Your Next Rave
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl max-w-xl">
          Find the best raves and music events near you. Let the beat guide you.
        </p>
        <div className="mt-8 space-x-4">
          <Link href="/find-events">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300">
              Find Events
            </button>
          </Link>
          <Link href="/create-event">
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300">
              Create an Event
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
