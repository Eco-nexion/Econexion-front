# 🔐 Google OAuth Configuration - URIs to Register

## 📋 Current Configuration

**App Scheme:** `econexion`  
**Expo Slug:** `econexion-app`  
**Expo Owner:** `Eco-nexion`

## ✅ Redirect URIs to Add in Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

### **1. Development (Expo Go)**
```
econexion://redirect
```

### **2. Expo Auth Proxy (Recommended for Production)**
```
https://auth.expo.io/@Eco-nexion/econexion-app
```

### **3. Web Development (Localhost)**
```
http://localhost:8081
```

### **4. Alternative Expo Development URI**
```
exp://localhost:8081
```

## 🔧 Steps to Configure

1. **Open Google Cloud Console**
   - Navigate to: https://console.cloud.google.com
   - Select your project

2. **Go to Credentials**
   - APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID

3. **Add Authorized redirect URIs**
   - Click "Edit OAuth client"
   - Scroll to "Authorized redirect URIs"
   - Click "+ ADD URI" for each one above
   - Click "SAVE"

4. **Wait for propagation**
   - Changes may take 5-10 minutes to take effect
   - Clear app cache and restart if needed

## 🧪 Testing

After configuration:

1. Run: `pnpm start --clear`
2. Scan QR with Expo Go
3. Check console for debug logs:
   ```
   🔧 Google OAuth Configuration Debug
   🔗 Redirect URI: econexion://redirect
   ```
4. Try Google Login
5. Should work without 400 error

## ⚠️ Troubleshooting

### Error: "redirect_uri_mismatch"
- The URI in the logs doesn't match what's registered
- Copy exact URI from console logs
- Re-add to Google Cloud Console
- Wait 5-10 minutes

### Error: "invalid_client"
- Check that Client IDs in .env match Google Cloud Console
- Verify you're using the correct Client ID for each platform

### Still getting 400 error
1. Clear Expo cache: `pnpm start --clear`
2. Verify all URIs are saved in Google Cloud Console
3. Try incognito/private mode in browser
4. Check console logs for exact URI being used

## 📝 Environment Variables

Make sure your `.env` has:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-actual-web-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-actual-android-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id (optional for Expo Go)
```

## 🚀 Alternative: Use Expo Auth Proxy

For easier setup, you can use Expo's auth proxy by modifying `app/index.tsx`:

```typescript
const redirectUri = makeRedirectUri({
    useProxy: true
});
```

This generates: `https://auth.expo.io/@Eco-nexion/econexion-app`

Only register this one URI in Google Cloud Console.

**Pros:**
- Only one URI to manage
- Works across all platforms
- Handles redirects automatically

**Cons:**
- Requires internet connection
- Slightly slower than direct scheme
- Depends on Expo's proxy service

## 📚 References

- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo makeRedirectUri](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturi)
