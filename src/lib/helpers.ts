import { signIn } from 'next-auth/react';

const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_ID;
if (!issuer || !clientId) {
  throw new Error('Something went wrong');
}
const registrationEndpoint = `${issuer}/protocol/openid-connect/registrations`;

export const createRegistrationUrl = (
  redirectUri: string,
  customParams: Record<string, string> = {}
) => {
  const params = new URLSearchParams();
  params.set('client_id', clientId as string);
  params.set('redirect_uri', `${redirectUri}`);
  params.set('scope', 'openid email profile');
  params.set('response_type', 'code');

  // Add custom parameters to the URL
  Object.entries(customParams).forEach(([key, value]) => {
    params.set(key, value);
  });

  return `${registrationEndpoint}?${params.toString()}`;
};

/**
 * Custom sign-in function that allows passing additional parameters
 * @param provider The authentication provider (e.g., 'keycloak')
 * @param customParams Custom parameters to include in the authentication request
 * @returns Promise that resolves when sign-in is complete
 */
export async function customSignIn(
  provider: string,
  customParams: Record<string, string> = {}
) {
  // Create a state parameter that includes our custom parameters
  const stateData = JSON.stringify(customParams);
  const encodedState = encodeURIComponent(stateData);

  // Call signIn with the custom state parameter
  return signIn(provider, {
    state: encodedState,
    // You can also add other standard parameters here
    callbackUrl: customParams.redirect_uri || window.location.origin
  });
}

/**
 * Registers the FCM device token for the current user
 * @param api - The axios instance with authentication headers
 * @param token - The FCM token to register
 * @param deviceType - The type of device (ios, web, android)
 * @returns Promise that resolves when the registration is complete
 */

/**
 * Detect device type based on user agent
 * @returns The detected device type: 'ios', 'android', or 'web'
 */
export function detectDeviceType(): 'ios' | 'web' | 'android' {
  if (typeof navigator === 'undefined') return 'web';

  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else {
    return 'web';
  }
}
