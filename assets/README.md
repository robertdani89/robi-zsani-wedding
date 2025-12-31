# Assets Placeholder

This folder should contain the following image assets for the app:

## Required Assets

1. **icon.png** (1024x1024px)

   - App icon shown on device home screen
   - Should be square with rounded corners (iOS handles this automatically)
   - Recommended: Wedding-themed icon (rings, hearts, couple initials)

2. **splash.png** (1284x2778px for iOS, 1080x1920px for Android)

   - Launch screen image shown when app starts
   - Background color: #FFF5F7 (light pink)
   - Suggested design: Couple names with decorative elements

3. **adaptive-icon.png** (1024x1024px, Android only)

   - Foreground layer for Android adaptive icon
   - Should work with various mask shapes
   - Keep important elements in safe zone (center 66%)

4. **favicon.png** (48x48px, for web)
   - Small icon for web browser tab
   - Simple, recognizable design

## How to Add Assets

1. Create or design your images using design tools (Figma, Canva, Photoshop, etc.)
2. Export at the required dimensions
3. Place files in this `assets/` folder
4. File names must match exactly: `icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`

## Temporary Solution

For quick testing, you can:

1. Use Expo's default assets (they're already configured)
2. Generate placeholder images using online tools like:
   - https://www.figma.com
   - https://www.canva.com
   - https://placeholder.com (for quick testing)

## Design Tips

- Use wedding colors: #D4526E (pink), #7D5260 (muted pink)
- Include hearts, rings, or floral elements
- Keep text minimal and readable
- Ensure good contrast for visibility
- Test on both light and dark mode devices

## Current Status

⚠️ **Action Required**: Add actual image assets to this folder before building for production.

For now, create simple colored squares with the couple's initials to test the app functionality.
