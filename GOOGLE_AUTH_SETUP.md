# Google Authentication Setup

This branch implements Google OAuth authentication as the primary sign-in method for wrkplay, replacing Slack authentication.

## Changes Made

1. **NextAuth Configuration**
   - Added Google provider to NextAuth configuration
   - Google sign-in is now the default authentication method
   - Slack authentication is still available but no longer primary
   - Custom sign-in page at `/auth/signin`

2. **UI Updates**
   - Created custom sign-in page with Google sign-in button
   - Updated sign-in buttons to use new authentication flow
   - Google sign-in button is prominently displayed

3. **User Management**
   - Users created via Google OAuth maintain same role structure
   - Slack notifications only sent for Slack users
   - Email is always provided by Google OAuth

## Environment Variables

Add these to your `.env.local` file:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Keep Slack for backward compatibility
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
```

## Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
8. Click "Create"
9. Copy the Client ID and Client Secret
10. Update your `.env.local` file with the real values:
    ```
    GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your-actual-client-secret
    ```

## Testing

1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign in" button
4. You'll be redirected to custom sign-in page
5. Click "Sign in with Google"
6. Complete Google OAuth flow
7. You'll be redirected back to the app, authenticated

## Notes

- Dev login is still available in development mode
- GitHub provider configuration remains unchanged
- User roles and permissions work the same way
- Slack-specific features (notifications, user creation from Slack) only activate for Slack users