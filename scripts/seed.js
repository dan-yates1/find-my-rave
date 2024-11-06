const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      title: "Summer Bass Festival",
      description: "Experience the biggest bass music festival of the summer featuring top DJs and producers from around the world.",
      startDate: new Date('2024-07-15T18:00:00'),
      endDate: new Date('2024-07-16T02:00:00'),
      location: "London, UK",
      latitude: 51.5434,
      longitude: -0.0159,
      link: "https://example.com/summer-bass-festival",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/summer-bass.jpg",
      approved: true,
      slug: "summer-bass-festival",
    },
    {
      title: "Underground Techno Night",
      description: "A night of pure techno in one of London's most iconic underground venues.",
      startDate: new Date('2024-06-22T23:00:00'),
      endDate: new Date('2024-06-23T06:00:00'),
      location: "London, UK",
      latitude: 51.5201,
      longitude: -0.1019,
      link: "https://example.com/underground-techno-night",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/techno-night.jpg",
      approved: true,
      slug: "underground-techno-night",
    },
    {
      title: "Trance Euphoria",
      description: "Get lost in the euphoric sounds of trance music with international headliners.",
      startDate: new Date('2024-08-05T21:00:00'),
      endDate: new Date('2024-08-06T04:00:00'),
      location: "Manchester, UK",
      latitude: 53.4631,
      longitude: -2.2817,
      link: "https://example.com/trance-euphoria",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/trance.jpg",
      approved: true,
      slug: "trance-euphoria",
    },
    {
      title: "Drum & Bass Warehouse Party",
      description: "Raw, unfiltered drum & bass in a converted warehouse space.",
      startDate: new Date('2024-09-14T22:00:00'),
      endDate: new Date('2024-09-15T06:00:00'),
      location: "Bristol, UK",
      latitude: 51.4478,
      longitude: -2.5826,
      link: "https://example.com/drum-and-bass-warehouse-party",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/dnb.jpg",
      approved: true,
      slug: "drum-and-bass-warehouse-party",
    },
    {
      title: "House Music Garden Party",
      description: "Open-air house music experience in a beautiful garden setting.",
      startDate: new Date('2024-07-28T14:00:00'),
      endDate: new Date('2024-07-28T22:00:00'),
      location: "Brighton, UK",
      latitude: 50.8225,
      longitude: -0.1372,
      link: "https://example.com/house-music-garden-party",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/house-garden.jpg",
      approved: true,
      slug: "house-music-garden-party",
    },
    {
      title: "Psytrance Forest Gathering",
      description: "An immersive psytrance experience in a magical forest setting.",
      startDate: new Date('2024-08-20T12:00:00'),
      endDate: new Date('2024-08-21T12:00:00'),
      location: "Kent, UK",
      latitude: 51.2796,
      longitude: 0.5215,
      link: "https://example.com/psytrance-forest-gathering",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/psytrance.jpg",
      approved: true,
      slug: "psytrance-forest-gathering",
    },
    {
      title: "Garage & Grime Takeover",
      description: "The best of UK garage and grime with legendary MCs and DJs.",
      startDate: new Date('2024-06-29T21:00:00'),
      endDate: new Date('2024-06-30T04:00:00'),
      location: "Birmingham, UK",
      latitude: 52.4751,
      longitude: -1.8795,
      link: "https://example.com/garage-and-grime-takeover",
      imageUrl: "https://find-my-rave.s3.eu-west-2.amazonaws.com/seed/garage.jpg",
      approved: true,
      slug: "garage-and-grime-takeover",
    },
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