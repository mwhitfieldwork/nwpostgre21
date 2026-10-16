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