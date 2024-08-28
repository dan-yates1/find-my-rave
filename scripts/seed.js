const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      slug: "indie-rock-islington",
      title: "Indie Rock Islington",
      description: "Catch the best indie rock bands in Islington.",
      startDate: new Date("2024-12-05T19:30:00Z"),
      endDate: new Date("2024-12-06T00:30:00Z"),
      location: "Islington, London, UK",
      latitude: 51.5343,
      longitude: -0.1055,
      link: "http://example.com/indie-rock-islington",
      imageUrl: "http://example.com/images/indie-rock-islington.jpg",
      approved: true,
    },
    {
      slug: "electro-dance-shoreditch",
      title: "Electro Dance Shoreditch",
      description:
        "Dance the night away with electrifying beats in Shoreditch.",
      startDate: new Date("2024-12-31T20:00:00Z"),
      endDate: new Date("2025-01-01T04:00:00Z"),
      location: "Shoreditch, London, UK",
      latitude: 51.5275,
      longitude: -0.0799,
      link: "http://example.com/electro-dance-shoreditch",
      imageUrl: "http://example.com/images/electro-dance-shoreditch.jpg",
      approved: true,
    },
    {
      slug: "festival-southbank",
      title: "Festival on the Southbank",
      description: "Enjoy live music and arts at the Southbank Centre.",
      startDate: new Date("2024-08-25T12:00:00Z"),
      endDate: new Date("2024-08-25T23:00:00Z"),
      location: "Southbank, London, UK",
      latitude: 51.5074,
      longitude: -0.1178,
      link: "http://example.com/festival-southbank",
      imageUrl: "http://example.com/images/festival-southbank.jpg",
      approved: true,
    },
    {
      slug: "garage-nights-hackney",
      title: "Garage Nights Hackney",
      description: "Experience the best of UK garage music in Hackney.",
      startDate: new Date("2024-09-15T22:00:00Z"),
      endDate: new Date("2024-09-16T04:00:00Z"),
      location: "Hackney, London, UK",
      latitude: 51.545,
      longitude: -0.0553,
      link: "http://example.com/garage-nights-hackney",
      imageUrl: "http://example.com/images/garage-nights-hackney.jpg",
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
