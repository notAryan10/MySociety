# EAS Build Deployment Guide for MySociety

## Current Status
✅ EAS CLI installed
✅ Notification code uncommented and ready
⏳ Waiting for Expo login

## Step-by-Step Deployment

### 1. Login to EAS (IN PROGRESS)
The terminal is currently asking for your Expo credentials:
```
? Email or username ›
```

**Action**: Enter your Expo account email/username and password in the terminal.

### 2. Configure EAS Build
After login, the command will create `eas.json` with build configurations.

### 3. Update app.json (Required for Notifications)
Add your Expo project configuration:

```json
{
  "expo": {
    "name": "MySociety",
    "slug": "MySociety",
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID_HERE"
      }
    },
    // ... rest of config
  }
}
```

You'll get the `projectId` after running `eas build:configure`.

### 4. Build for Android
```bash
eas build --profile development --platform android
```

Or for production:
```bash
eas build --profile production --platform android
```

### 5. Install on Device
After the build completes (~15-30 minutes), you'll get a download link.
Download the APK and install it on your Android device.

## What Will Work After Deployment

✅ **Push Notifications** - Full support on physical devices
✅ **All App Features** - Everything works as in Expo Go
✅ **Production Ready** - Can be published to Google Play Store

## Backend Deployment (Optional)

Your backend is currently running locally. For production:

1. Deploy backend to a service like:
   - Heroku
   - Railway
   - Render
   - DigitalOcean

2. Update `frontend/src/services/api.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.com';
   ```

## Next Steps

1. ✅ Complete Expo login in terminal
2. ⏳ Wait for `eas.json` to be created
3. ⏳ Update `app.json` with projectId
4. ⏳ Run build command
5. ⏳ Install APK on Android device
6. ⏳ Test push notifications!
