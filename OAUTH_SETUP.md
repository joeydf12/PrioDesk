# OAuth Setup Instructions

This document explains how to configure Google and Slack OAuth providers in your Supabase project.

## Prerequisites

- A Supabase project
- Google Cloud Console access (for Google OAuth)
- Slack App configuration (for Slack OAuth)

## Google OAuth Setup

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add your authorized redirect URIs:
   - `https://tbbwguwzjjhuldmlrebh.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for local development)
8. Copy the Client ID and Client Secret

### 2. Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Find Google in the list and click "Edit"
4. Enable Google authentication
5. Enter your Google Client ID and Client Secret
6. Save the configuration

## Slack OAuth Setup

### 1. Slack App Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Give your app a name and select your workspace
4. In the left sidebar, go to "OAuth & Permissions"
5. Add the following redirect URLs:
   - `https://tbbwguwzjjhuldmlrebh.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for local development)
6. Under "Scopes", add the following bot token scopes:
   - `users:read`
   - `users:read.email`
7. Install the app to your workspace
8. Copy the Client ID and Client Secret

### 2. Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Find Slack in the list and click "Edit"
4. Enable Slack authentication
5. Enter your Slack Client ID and Client Secret
6. Save the configuration

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Slack OAuth
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_SLACK_CLIENT_SECRET=your_slack_client_secret
```

## Testing

1. Start your development server
2. Go to the login or register page
3. Click on the Google or Slack button
4. You should be redirected to the respective OAuth provider
5. After successful authentication, you'll be redirected back to your app

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**: Make sure the redirect URIs in your OAuth provider settings match exactly with what Supabase expects
2. **CORS issues**: Ensure your domain is properly configured in the OAuth provider settings
3. **Missing scopes**: Make sure you've added the necessary scopes for user information

### Error Messages

- "Invalid redirect_uri": Check your redirect URI configuration
- "Invalid client_id": Verify your client ID is correct
- "Access denied": Check your app permissions and scopes

## Security Notes

- Never commit your OAuth secrets to version control
- Use environment variables for sensitive configuration
- Regularly rotate your OAuth secrets
- Monitor your OAuth usage and set up proper rate limiting

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Slack OAuth Documentation](https://api.slack.com/authentication/oauth-v2) 