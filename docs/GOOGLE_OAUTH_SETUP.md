# Google OAuth Setup Guide for Mobile Gym Tracker

This guide will walk you through setting up Google OAuth authentication for the Mobile Gym Tracker app.

## Prerequisites

- Access to Google Cloud Console
- Your app's bundle identifier (for mobile apps)
- Convex deployment URL

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "Mobile Gym Tracker")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API" and then click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Mobile Gym Tracker
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. Add scopes (optional for basic setup) - click "Save and Continue"
7. Add test users if needed - click "Save and Continue"
8. Review and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. You'll need to create credentials for each platform:

### For Web Application (Development/Testing)

1. Choose "Web application" as application type
2. Name: "Mobile Gym Tracker - Web"
3. Add authorized redirect URIs:
   - `http://localhost:8081` (for Expo development)
   - Your Convex deployment URL + `/api/auth/callback/google`
   - Example: `https://your-deployment.convex.cloud/api/auth/callback/google`

### For iOS Application

1. Click "Create Credentials" > "OAuth 2.0 Client IDs" again
2. Choose "iOS" as application type
3. Name: "Mobile Gym Tracker - iOS"
4. Bundle ID: Your iOS bundle identifier (from app.json or Info.plist)
   - Example: `com.yourcompany.mobilegymtracker`

### For Android Application

1. Click "Create Credentials" > "OAuth 2.0 Client IDs" again
2. Choose "Android" as application type
3. Name: "Mobile Gym Tracker - Android"
4. Package name: Your Android package name (from app.json)
   - Example: `com.yourcompany.mobilegymtracker`
5. SHA-1 certificate fingerprint:
   - For development, use the debug keystore fingerprint
   - Run: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in your Convex directory with the following variables:

```bash
# Google OAuth Configuration
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here
```

2. In your Convex dashboard, go to Settings > Environment Variables and add:
   - `AUTH_GOOGLE_ID`: Your Google OAuth client ID (web application)
   - `AUTH_GOOGLE_SECRET`: Your Google OAuth client secret (web application)

## Step 6: Update App Configuration

### Update app.json for Expo

Add the scheme to your `app.json`:

```json
{
  "expo": {
    "scheme": "mobilegymtracker"
    // ... other config
  }
}
```

### Update for iOS (if building standalone)

Add URL scheme to your Info.plist:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>mobilegymtracker</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>mobilegymtracker</string>
    </array>
  </dict>
</array>
```

### Update for Android (if building standalone)

Add intent filter to your AndroidManifest.xml:

```xml
<activity
  android:name=".MainActivity"
  android:exported="true"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="mobilegymtracker" />
  </intent-filter>
</activity>
```

## Step 7: Test the Integration

1. Start your development server:

   ```bash
   npm start
   ```

2. Start your Convex development server:

   ```bash
   npx convex dev
   ```

3. Open your app and try signing in with Google

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch" error

**Solution**: Make sure the redirect URI in your Google Console matches exactly with what your app is sending. Check:

- HTTP vs HTTPS
- Trailing slashes
- Port numbers for development

### Issue: "invalid_client" error

**Solution**:

- Verify your client ID and secret are correct
- Make sure you're using the right client ID for the platform (web for OAuth flow)
- Check that the OAuth consent screen is properly configured

### Issue: App crashes on iOS/Android

**Solution**:

- Verify bundle ID/package name matches exactly
- For Android, ensure SHA-1 fingerprint is correct
- Check URL scheme configuration

## Security Notes

1. **Never commit your client secret to version control**
2. Use environment variables for all sensitive data
3. Use different client IDs for development and production
4. Regularly rotate your client secrets
5. Monitor OAuth usage in Google Cloud Console

## Testing Checklist

- [ ] Google sign-in works in Expo development
- [ ] Redirect after successful authentication works
- [ ] User profile data is correctly retrieved
- [ ] Sign-out functionality works
- [ ] Error handling for failed authentication
- [ ] Cross-platform compatibility (iOS/Android/Web)

## Next Steps

After setting up Google OAuth:

1. Test thoroughly on all target platforms
2. Set up production credentials for app store releases
3. Configure additional OAuth providers if needed
4. Implement user profile management features
5. Add proper error handling and user feedback

For additional help, refer to:

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
