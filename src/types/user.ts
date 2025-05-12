export interface UserProps {
  id: string;
  name: string;
  email: string;
  image: string;
  givenName: string;
  familyName: string;
}

export type TokensProps = {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
};
export interface DefaultUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface Account {
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
export interface Profile {
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
export interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  accessExpiresAt: number;
  refreshExpiresIn: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  gender: string | null;
  phone_number: string | null;
  profile_img: string | null;
  birth_date: string | null;
  is_active: boolean;
  subscription: String | null;
  is_registered: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSummary {
  first_name: string;
  subscription: String | null;
  is_active: boolean;
  is_registered: boolean;
  is_free_trial: boolean;
}
