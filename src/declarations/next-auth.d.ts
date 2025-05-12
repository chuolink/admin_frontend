import { UserProps, BackendTokens, User as UP } from '@/types/user';
declare module 'next-auth' {
  interface Session {
    user: UP;
    backendTokens: BackendTokens;
    error: string | undefined;
    roles: string[];
  }
  interface User extends UP {}
  interface Account {
    provider: string;
    type: string;
    providerAccountId: string;
    access_token: string;
    expires_at: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    id_token: string;
    'not-before-policy': number;
    session_state: string;
    scope: string;
  }
  interface Profile {
    exp: number;
    iat: number;
    auth_time: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    session_state: string;
    at_hash: string;
    acr: string;
    sid: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: UP;
    backendTokens: BackendTokens;
    error: string | undefined;
    roles: string[];
  }
}
