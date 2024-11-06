const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      title: "Minimal Techno Underground",
      description: "Experience the hypnotic sounds of minimal techno in an intimate underground setting with international DJs.",
      startDate: new Date('2024-07-08T22:00:00'),
      endDate: new Date('2024-07-09T06:00:00'),
      location: "Leeds, UK",
      latitude: 53.8008,
      longitude: -1.5491,
      link: "https://example.com/minimal-techno-underground",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/minimal-techno.jpg",
      approved: true,
      slug: "minimal-techno-underground",
    },
    {
      title: "Bass Music Festival",
      description: "A massive outdoor festival featuring the biggest names in dubstep, drum & bass, and bass music.",
      startDate: new Date('2024-08-12T12:00:00'),
      endDate: new Date('2024-08-13T23:00:00'),
      location: "Sheffield, UK",
      latitude: 53.3811,
      longitude: -1.4701,
      link: "https://example.com/bass-music-festival",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/bass-festival.jpg",
      approved: true,
      slug: "bass-music-festival",
    },
    {
      title: "Disco & House All-Nighter",
      description: "A celebration of disco and house music classics, featuring rare vinyl sets and live performances.",
      startDate: new Date('2024-09-21T21:00:00'),
      endDate: new Date('2024-09-22T07:00:00'),
      location: "Newcastle, UK",
      latitude: 54.9783,
      longitude: -1.6178,
      link: "https://example.com/disco-house-allnighter",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/disco-house.jpg",
      approved: true,
      slug: "disco-house-allnighter",
    },
    {
      title: "Jungle Revival",
      description: "Step back in time with a night dedicated to old school jungle and ragga jungle classics.",
      startDate: new Date('2024-10-05T22:00:00'),
      endDate: new Date('2024-10-06T06:00:00'),
      location: "Bristol, UK",
      latitude: 51.4545,
      longitude: -2.5879,
      link: "https://example.com/jungle-revival",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/jungle.jpg",
      approved: true,
      slug: "jungle-revival",
    },
    {
      title: "Hard Dance Warehouse",
      description: "The ultimate hardstyle and hard dance experience in a raw industrial setting.",
      startDate: new Date('2024-11-02T21:00:00'),
      endDate: new Date('2024-11-03T06:00:00'),
      location: "Manchester, UK",
      latitude: 53.4808,
      longitude: -2.2426,
      link: "https://example.com/hard-dance-warehouse",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/hard-dance.jpg",
      approved: true,
      slug: "hard-dance-warehouse",
    }
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 