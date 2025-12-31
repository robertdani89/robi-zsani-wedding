# Robi & Zsani Wedding App 💕

A mobile wedding guest engagement application built with React Native and Expo.

> 📖 **New here?** Check [INDEX.md](INDEX.md) for a complete guide to all documentation!

## Features

- **Guest Identification**: Guests can register with their name
- **Interactive Questions**: Answer randomized fun questions from different categories
  - Travel & Vacation
  - Activities & Hobbies
  - Fun / Personal
- **Photo Upload**: Take photos or upload from gallery
- **Progress Tracking**: Real-time progress indicator
- **Gift Eligibility**: Complete all tasks to unlock a gift
- **Data Persistence**: All data saved locally using AsyncStorage

## Tech Stack

- **React Native** with Expo
- **expo-router** for navigation
- **TypeScript** for type safety
- **expo-image-picker** for camera and gallery access
- **AsyncStorage** for local data persistence

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on your device:
   - **iOS**: Scan QR code with Camera app or press `i` in terminal
   - **Android**: Scan QR code with Expo Go app or press `a` in terminal
   - **Web**: Press `w` in terminal (limited functionality)

## Project Structure

```
robi-zsani-wedding/
├── app/                      # Screen components (expo-router)
│   ├── _layout.tsx          # Root layout with navigation
│   ├── index.tsx            # Welcome screen
│   ├── identify.tsx         # Guest identification
│   ├── dashboard.tsx        # Main dashboard
│   ├── questions.tsx        # Questions interface
│   ├── photos.tsx           # Photo upload
│   ├── review.tsx           # Review & submit
│   └── completion.tsx       # Completion/gift screen
├── context/
│   └── AppContext.tsx       # Global state management
├── data/
│   └── questions.ts         # Question data and utilities
├── types/
│   └── index.ts             # TypeScript type definitions
├── assets/                   # Images and icons
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## User Flow

1. **Welcome Screen**: Introduction and "Get Started" button
2. **Guest Identification**: Enter name (can be fictional)
3. **Dashboard**: View progress and access tasks
4. **Answer Questions**: Complete 8 randomized questions
5. **Upload Photos**: Upload minimum 1 photo (max 5)
6. **Review & Submit**: Verify completion and submit
7. **Completion**: View gift eligibility confirmation

## Configuration

### Minimum Requirements

- Questions to answer: 8 (configurable in `data/questions.ts`)
- Photos required: 1 minimum (configurable in `data/questions.ts`)
- Maximum photos: 5 (configurable in `data/questions.ts`)

### Customization

**Wedding Details**: Edit [app/index.tsx](app/index.tsx)

- Couple names: Line 21
- Wedding date: Line 27
- Welcome message: Lines 30-36

**Question Bank**: Edit [data/questions.ts](data/questions.ts)

- Add/remove questions
- Modify categories
- Change question types

**Theme Colors**: Update styles in each screen

- Primary: `#D4526E` (Pink)
- Secondary: `#7D5260` (Muted pink)
- Background: `#FFF5F7` (Light pink)

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

You'll need to set up an Expo account and configure EAS Build. See [Expo documentation](https://docs.expo.dev/build/setup/) for details.

## Future Enhancements

- [ ] Firebase/Supabase integration for cloud storage
- [ ] Admin dashboard to view all submissions
- [ ] QR code for gift claim
- [ ] Social sharing features
- [ ] Multiple language support
- [ ] Push notifications
- [ ] Offline mode improvements

## Permissions Required

- **Camera**: To take photos at the wedding
- **Photo Library**: To upload existing photos
- **Storage**: To save data locally

## Troubleshooting

**Photos not uploading?**

- Ensure camera/gallery permissions are granted
- Check device storage space

**App crashing on start?**

- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Questions not randomizing?**

- Data persists per user session
- Questions are randomized once at guest identification

## License

Private project for Robi & Zsani's wedding.

## Support

For issues or questions, contact the development team.

---

Made with ❤️ for Robi & Zsani's Special Day
