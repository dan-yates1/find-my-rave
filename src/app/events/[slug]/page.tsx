import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";

const prisma = new PrismaClient();

interface EventDetailsPageProps {
  params: {
    slug: string;
  };
}

const EventDetailsPage = async ({ params }: EventDetailsPageProps) => {
  const event = await prisma.event.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      {/* Banner Image */}
      <div className="relative h-96 w-full">
        <Image
          src={event.imageUrl || "/rave-bg.jpg"}
          alt={event.title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row mt-8 lg:space-x-12">
        {/* Left Column: Event Details */}
        <div className="lg:w-2/3">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="mb-6">
            <p className="text-lg font-semibold">Date and time</p>
            <p className="text-gray-700">
              {new Date(event.startDate).toLocaleString()} -{" "}
              {new Date(event.endDate).toLocaleString()}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold">Location</p>
            <p className="text-gray-700">{event.location}</p>
          </div>
        </div>

        {/* Right Column: Ticket and Actions */}
        <div className="lg:w-1/3">
          <div className="border border-gray-300 p-4 rounded-lg shadow-lg">
            <p className="text-2xl font-bold mb-4">From £165</p>
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Get Tickets
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
