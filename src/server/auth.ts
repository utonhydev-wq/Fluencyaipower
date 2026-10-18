import appletConfig from '../../firebase-applet-config.json';

interface VerifiedUser {
  uid: string;
  email?: string;
  name?: string;
}

// In-memory token cache to avoid redundant network verification roundtrips (TTL 5 mins)
const tokenCache = new Map<string, { user: VerifiedUser; expiresAt: number }>();

const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  appletConfig.apiKey;

export async function verifyFirebaseIdToken(authHeader?: string): Promise<VerifiedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.substring(7).trim();
  if (!idToken) {
    return null;
  }

  // Check cache
  const cached = tokenCache.get(idToken);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  if (!FIREBASE_API_KEY) {
    console.warn('Firebase API Key not configured for server token verification.');
    return null;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Firebase ID Token validation failed:', errData?.error?.message || res.status);
      return null;
    }

    const data = await res.json();
    const userRecord = data.users?.[0];

    if (!userRecord || !userRecord.localId) {
      return null;
    }

    const verifiedUser: VerifiedUser = {
      uid: userRecord.localId,
      email: userRecord.email,
      name: userRecord.displayName,
    };

    // Cache verified user for 5 minutes
    tokenCache.set(idToken, {
      user: verifiedUser,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Clean old cache entries occasionally
    if (tokenCache.size > 500) {
      const now = Date.now();
      for (const [key, value] of tokenCache.entries()) {
        if (value.expiresAt <= now) {
          tokenCache.delete(key);
        }
      }
    }

    return verifiedUser;
  } catch (err: any) {
    console.error('Error contacting Google Identity Toolkit:', err.message);
    return null;
  }
}
