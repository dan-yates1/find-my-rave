![image](https://github.com/user-attachments/assets/d43a18c6-e441-4b71-b411-095182360e2b)

Find My Rave is a modern web application designed to help electronic music enthusiasts discover and track their favorite events, raves, and festivals. Built with Next.js 14 and TypeScript, it provides a seamless experience for finding and bookmarking electronic music events.

## Features ✨

- **Event Discovery**: Browse upcoming electronic music events filtered by genre, date, and location
- **Real-time Search**: Instantly search through thousands of events with location-based filtering
- **Genre Filtering**: Find events by specific genres:
  - House
  - Techno
  - Drum & Bass
  - Trance
  - Dubstep
  - Garage
  - Hardstyle
  - And more...
- **User Features**:
  - Bookmark favorite events
  - Personal profile management
  - Custom event preferences
- **Interactive Maps**: Visualize event locations using Mapbox integration
- **Responsive Design**: Optimized for all devices from mobile to desktop

## Screenshots 📸

### Home Page
![image](https://github.com/user-attachments/assets/782bd667-1d6e-4f9f-a728-75378230e94c)

### Event Discovery
![image](https://github.com/user-attachments/assets/f00a55b0-52b9-435f-95e6-3f5c39792b42)

### Event Details
![image](https://github.com/user-attachments/assets/71a2043c-e758-4e19-8454-0e74af1c06b8)

### User Profile
![image](https://github.com/user-attachments/assets/14386945-247f-4732-a544-2f820a0e0a47)

## Tech Stack 💻

### Frontend
- Next.js 14
- React with TypeScript
- TailwindCSS for styling
- Mapbox GL for maps
- React Query for data fetching

### Backend
- Next.js API Routes
- Prisma ORM
- MongoDB Database
- NextAuth.js for authentication
- AWS S3 for image storage

### APIs
- Skiddle API for event data
- Mapbox API for location services
- Google OAuth for authentication

## Getting Started 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/find-my-rave.git
```

2. Install dependencies:
```bash
cd find-my-rave
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
MONGODB_URI=
NEXT_PUBLIC_MAPBOX_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
SKIDDLE_API_KEY=
```

5. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

## API Routes 🛣️

The application includes several API endpoints:

- `/api/events` - Event discovery and filtering
- `/api/events/[platform]/[eventId]` - Individual event details
- `/api/bookmarks` - User event bookmarking
- `/api/user/*` - User profile management

## Features in Detail 🔍

### Event Discovery
- Real-time search with debouncing
- Multiple filter options (genre, date, location)
- Pagination support
- Location-based searching

### User Profiles
- Google OAuth integration
- Event bookmarking
- Profile customization

### Maps Integration
- Interactive venue locations
- Cluster mapping for multiple events
- Custom map styling

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License 📄

MIT License

Copyright (c) 2025 Daniel Yates

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Roadmap 🗺️

- [ ] Add more event sources and APIs
- [ ] Implement event recommendations
- [ ] Add social features and sharing
- [ ] Enhanced search capabilities
- [ ] Mobile app development
- [ ] Event reminders and notifications
- [ ] Ticket price tracking and alerts

## Support 💬

For support, email dsyates@live.co.uk.

---

Made with ❤️ by Dan
