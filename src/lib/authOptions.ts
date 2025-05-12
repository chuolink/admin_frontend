import { get } from 'http';
import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { BackendTokens } from '@/types/user';

import KeycloakProvider from 'next-auth/providers/keycloak';
import createAxiosInstance from './axiosInstance';
import { TokensProps } from '@/types/user';

function getKeycloakCredentials() {
  const clientId = process.env.KEYCLOAK_ID || '';
  const clientSecret = process.env.KEYCLOAK_SECRET || '';
  const issuer = process.env.KEYCLOAK_ISSUER || '';
  const next_auth_url = process.env.NEXTAUTH_URL || '';
  if (!clientId || clientId.length === 0)
    throw new Error('Missing KEYCLOAK_CLIENT_ID');
  if (!clientSecret || clientSecret.length === 0)
    throw new Error('Missing KEYCLOAK_CLIENT_SECRET');
  if (!issuer || issuer.length === 0)
    throw new Error('Missing KEYCLOAK_ISSUER');
  if (!next_auth_url || next_auth_url.length === 0)
    throw new Error('Missing NEXTAUTH_URL');

  return { clientId, clientSecret, issuer, next_auth_url };
}

export function requestRefreshOfAccessToken(token: BackendTokens) {
  return fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID!,
      client_secret: process.env.KEYCLOAK_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken!
    }),
    method: 'POST',
    cache: 'no-store'
  });
}
type ExtendedJWT = JWT & {
  backendTokens?: BackendTokens;
  user?: User;
  error?: string;
};

type ExtendedSession = Session & {
  backendTokens?: BackendTokens;
  user?: User;
  error?: string;
};

// Define types for token request parameters
interface TokenRequestParams {
  provider: {
    id: string;
    token?: string | { url?: string };
    clientId?: string;
    clientSecret?: string;
  };
  params: {
    code?: string;
    redirect_uri?: string;
    [key: string]: any;
  };
}
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: getKeycloakCredentials().clientId,
      clientSecret: getKeycloakCredentials().clientSecret,
      issuer: getKeycloakCredentials().issuer,
      checks: ['none'],
      token: {
        request: async ({ provider, params }: TokenRequestParams) => {
          //@ts-ignore
          const callbackUrl = provider.callbackUrl;
          // Extract code from params
          const code = params.code;
          // Get request object from params
          const redirect_uri = params.state;

          // Parse state to get custom parameters
          let customParams = {};
          try {
            if (typeof redirect_uri === 'string') {
              customParams = JSON.parse(decodeURIComponent(redirect_uri));
            }
          } catch (e) {
            console.error('Error parsing state:', e);
          }

          // Explicitly set the token endpoint using the Keycloak issuer
          //@ts-ignore
          const tokenEndpoint = `${provider.issuer}/protocol/openid-connect/token`;

          const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: provider.clientId || '',
              client_secret: provider.clientSecret || '',
              code: code as string,
              redirect_uri: callbackUrl,
              state: redirect_uri // Preserve the state parameter
            })
          });
          const tokens = await response.json();

          if (!response.ok) {
            throw new Error('Token exchange failed');
          }
          return { tokens };
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  pages: {
    signIn: '/',
    newUser: '/auth/register',
    signOut: '/'
  },
  callbacks: {
    async jwt({ token, user, trigger, account, profile }) {
      const buffer = 60 * 1000;
      let rtoken = token;

      if (user && profile) {
        const { given_name: givenName, family_name: familyName } = profile;

        if (account) {
          const {
            access_token: accessToken,
            id_token: idToken,
            refresh_token: refreshToken,
            expires_at: accessExpiresAt,
            refresh_expires_in: refreshExpiresIn
          } = account;

          token.backendTokens = {
            accessToken,
            idToken,
            refreshToken,
            accessExpiresAt: accessExpiresAt * 1000,
            refreshExpiresIn: Date.now() + refreshExpiresIn * 1000
          };
          // Extract roles from the access token
          const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
          const roles: string[] = decodedToken?.realm_access?.roles || [];
          token.roles = roles;
        }
      }

      if (Date.now() < token.backendTokens.accessExpiresAt) {
        if (!(token.user?.id && token.user.id.startsWith('usr'))) {
          // try {
          try {
            const api = createAxiosInstance(token.backendTokens.accessToken);
            const response = await api.get('/user?me=here');
            token.user = response.data[0];
            return token;
          } catch (error) {
            return { ...token, error: 'RefreshAccessTokenError' };
          }
        }

        return token;
      } else {
        try {
          if (Date.now() > token.backendTokens.refreshExpiresIn) {
            throw new Error('Refresh token expired');
          }
          const res = await requestRefreshOfAccessToken(token.backendTokens);

          if (!res.ok) throw new Error('Failed to get refresh token');

          const tokens: TokensProps = await res.json();

          const updatedToken = {
            ...token,
            backendTokens: {
              accessToken: tokens.access_token,
              idToken: tokens.id_token,
              refreshToken: tokens.refresh_token,
              accessExpiresAt: Date.now() + tokens.expires_in * 1000,
              refreshExpiresIn: Date.now() + tokens.refresh_expires_in * 1000
            }
          };
          const decodedToken = JSON.parse(
            atob(updatedToken.backendTokens.accessToken.split('.')[1])
          );
          const roles: string[] = decodedToken?.realm_access?.roles || [];
          updatedToken.roles = roles;
          const api = createAxiosInstance(
            updatedToken.backendTokens.accessToken
          );
          if (
            !(updatedToken.user?.id && updatedToken.user.id.startsWith('usr'))
          ) {
            await api
              .get('/user')
              .then((res) => {
                updatedToken.user = res.data[0];
              })
              .catch((error) => {
                console.log('Error fetching user');
              });
          }

          return updatedToken;
        } catch (error) {
          const newToken = { ...token, error: 'RefreshAccessTokenError' };

          return newToken;
        }
      }
    },
    async session({ session, token }) {
      session.user = token.user;

      session.backendTokens = token.backendTokens;

      session.error = token?.error;
      session.roles = token.roles;

      return session;
    }
  },

  events: {
    async signOut({ session, token }) {
      const path = `${
        getKeycloakCredentials().issuer
      }/protocol/openid-connect/logout? 
      redirect_uri=${encodeURIComponent(
        getKeycloakCredentials().next_auth_url
      )}`;
      const id_token = token.backendTokens.idToken;
      const logoutUrl = `${path}&id_token_hint=${id_token}`;
      const res = await fetch(logoutUrl);
      console.log(res.status, 'logout status');
    }
  }
};
