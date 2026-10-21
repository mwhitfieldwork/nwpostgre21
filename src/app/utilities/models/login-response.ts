// WHAT: Describes what the API sends back after Google sign-in
//       (POST api/Login/GoogleCallback).
// WHY:  So the editor knows the shape and catches typos,
//       instead of trusting "any".
// HOW:  Field names copied from the real response in the Network tab.

// The user details inside the response.
export interface LoginUser {
  pkid: number;
  username: string;
  admin: boolean;
  firstname: string;
  occupation: string | null; // "| null" means it can be empty
  picture: string;
  // We leave out "password" on purpose. An interface only needs
  // the fields we use, and we never want to touch that one.
}

// The whole response.
export interface LoginResponse {
  message: string;
  user: LoginUser;
  token: string;
}
// WHAT: The email/password sign-in reply (POST api/Login).
// WHY:  The API wraps its answer in a second Ok(), so the real
//       data sits inside "value". On a bad password, "value" is
//       just an error message (text) instead of the login data.
// HOW:  "A | B" means "either A or B". The code that reads it
//       has to check which one it got before using it.
export interface WrappedLoginResponse {
  value: LoginResponse | string;
  statusCode: number; // 200 = success, 400/401 = problem
}

/**
 * WHAT: Checks whether the email/password reply's "value" is the
 *       real login data, or just an error message (text).
 * WHY:  "value" can be either one (LoginResponse | string). This gives
 *       the check a name, so any component can reuse it.
 * HOW:  The special return type "value is LoginResponse" tells TypeScript:
 *       if this returns true, treat value as a LoginResponse from here on.
 */
export function isLoginResponse(value: LoginResponse | string): value is LoginResponse {
  return typeof value !== 'string' && !!value.token;
}