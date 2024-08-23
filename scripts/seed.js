const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      slug: 'summer-festival-2024',
      title: 'Summer Festival 2024',
      description: 'Join us for the biggest summer festival of the year!',
      startDate: new Date('2024-07-21T18:00:00Z'),
      endDate: new Date('2024-07-23T23:59:00Z'),
      location: 'Berlin, Germany',
      link: 'http://example.com/summer-festival-2024',
      imageUrl: 'http://example.com/images/summer-festival.jpg',
      approved: true,
    },
    {
      slug: 'electronic-dance-night',
      title: 'Electronic Dance Night',
      description: 'A night full of electronic beats and dance!',
      startDate: new Date('2024-08-15T20:00:00Z'),
      endDate: new Date('2024-08-16T04:00:00Z'),
      location: 'Amsterdam, Netherlands',
      link: 'http://example.com/electronic-dance-night',
      imageUrl: 'http://example.com/images/electronic-dance-night.jpg',
      approved: false,
    },
    {
      slug: 'techno-paradise',
      title: 'Techno Paradise',
      description: 'Experience the best techno music with world-class DJs.',
      startDate: new Date('2024-09-05T22:00:00Z'),
      endDate: new Date('2024-09-06T06:00:00Z'),
      location: 'Detroit, USA',
      link: 'http://example.com/techno-paradise',
      imageUrl: 'http://example.com/images/techno-paradise.jpg',
      approved: true,
    },
  ];

  // Insert events into the database
  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Sample events have been added to the database');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
