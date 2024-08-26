const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      slug: "summer-festival-2024",
      title: "Summer Festival 2024",
      description: "Join us for the biggest summer festival of the year!",
      startDate: new Date("2024-07-21T18:00:00Z"),
      endDate: new Date("2024-07-23T23:59:00Z"),
      location: "Berlin, Germany",
      latitude: 52.52,
      longitude: 13.405,
      link: "http://example.com/summer-festival-2024",
      imageUrl: "http://example.com/images/summer-festival.jpg",
      approved: true,
    },
    {
      slug: "electronic-dance-night",
      title: "Electronic Dance Night",
      description: "A night full of electronic beats and dance!",
      startDate: new Date("2024-08-15T20:00:00Z"),
      endDate: new Date("2024-08-16T04:00:00Z"),
      location: "Amsterdam, Netherlands",
      latitude: 52.3702,
      longitude: 4.8952,
      link: "http://example.com/electronic-dance-night",
      imageUrl: "http://example.com/images/electronic-dance-night.jpg",
      approved: false,
    },
    {
      slug: "techno-paradise",
      title: "Techno Paradise",
      description: "Experience the best techno music with world-class DJs.",
      startDate: new Date("2024-09-05T22:00:00Z"),
      endDate: new Date("2024-09-06T06:00:00Z"),
      location: "Detroit, USA",
      latitude: 42.3314,
      longitude: -83.0458,
      link: "http://example.com/techno-paradise",
      imageUrl: "http://example.com/images/techno-paradise.jpg",
      approved: true,
    },
    {
      slug: "techno-night-camden",
      title: "Techno Night Camden",
      description: "An electrifying night of techno music in Camden.",
      startDate: new Date("2024-08-05T22:00:00Z"),
      endDate: new Date("2024-08-06T04:00:00Z"),
      location: "Camden, London, UK",
      latitude: 51.5416,
      longitude: -0.1431,
      link: "http://example.com/techno-night-camden",
      imageUrl: "http://example.com/images/techno-night-camden.jpg",
      approved: true,
    },
    {
      slug: "house-party-brixton",
      title: "House Party Brixton",
      description: "Join the best house party in Brixton.",
      startDate: new Date("2024-09-10T20:00:00Z"),
      endDate: new Date("2024-09-11T02:00:00Z"),
      location: "Brixton, London, UK",
      latitude: 51.4613,
      longitude: -0.1156,
      link: "http://example.com/house-party-brixton",
      imageUrl: "http://example.com/images/house-party-brixton.jpg",
      approved: true,
    },
    {
      slug: "drum-and-bass-finsbury",
      title: "Drum and Bass Finsbury",
      description:
        "Get ready for a night of non-stop drum and bass in Finsbury Park.",
      startDate: new Date("2024-10-15T21:00:00Z"),
      endDate: new Date("2024-10-16T03:00:00Z"),
      location: "Finsbury Park, London, UK",
      latitude: 51.5645,
      longitude: -0.1052,
      link: "http://example.com/drum-and-bass-finsbury",
      imageUrl: "http://example.com/images/drum-and-bass-finsbury.jpg",
      approved: true,
    },
    {
      slug: "jazz-night-soho",
      title: "Jazz Night Soho",
      description: "Experience the smooth sounds of jazz in Soho.",
      startDate: new Date("2024-11-12T19:00:00Z"),
      endDate: new Date("2024-11-13T00:00:00Z"),
      location: "Soho, London, UK",
      latitude: 51.5145,
      longitude: -0.1313,
      link: "http://example.com/jazz-night-soho",
      imageUrl: "http://example.com/images/jazz-night-soho.jpg",
      approved: true,
    },
  ];

  /* for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        link: event.link,
        imageUrl: event.imageUrl,
        approved: event.approved,
      },
      create: event,
    });
  }

  console.log("Seeding completed.");
} */

  // Insert events into the database
  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }
}

console.log("Sample events have been added to the database");

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
