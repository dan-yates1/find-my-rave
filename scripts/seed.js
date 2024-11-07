const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      title: "Minimal Techno Underground",
      description: "Experience the hypnotic sounds of minimal techno in an intimate underground setting with international DJs.",
      startDate: new Date('2024-07-08T22:00:00'),
      endDate: new Date('2024-07-09T06:00:00'),
      location: "Underground Club, London",
      town: "London",
      latitude: 51.5074,
      longitude: -0.1278,
      link: "https://example.com/minimal-techno-underground",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/minimal-techno.jpg",
      approved: true,
      slug: "minimal-techno-underground",
      eventType: "other"
    },
    {
      title: "Bass Music Festival",
      description: "A massive outdoor festival featuring the biggest names in dubstep, drum & bass, and bass music.",
      startDate: new Date('2024-08-12T12:00:00'),
      endDate: new Date('2024-08-13T23:00:00'),
      location: "Festival Park, London",
      town: "London",
      latitude: 51.5074,
      longitude: -0.1278,
      link: "https://example.com/bass-music-festival",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/bass-festival.jpg",
      approved: true,
      slug: "bass-music-festival",
      eventType: "other"
    },
    {
      title: "Disco & House All-Nighter",
      description: "A celebration of disco and house music classics, featuring rare vinyl sets and live performances.",
      startDate: new Date('2024-09-21T21:00:00'),
      endDate: new Date('2024-09-22T07:00:00'),
      location: "Nightclub Venue, London",
      town: "London",
      latitude: 51.5074,
      longitude: -0.1278,
      link: "https://example.com/disco-house-allnighter",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/disco-house.jpg",
      approved: true,
      slug: "disco-house-allnighter",
      eventType: "other"
    }
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 