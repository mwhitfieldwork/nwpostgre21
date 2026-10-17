// WHAT: Describes the plain User the API sends back from
//       POST api/Login (sign in) and POST api/Login/AddUser (sign up).
// WHY:  Those two calls return the C# User class as-is, which is a
//       different shape from the Google reply (LoginUser).
//       Without this, the service would have to say "any".
// HOW:  Names copied from the C# User class. .NET sends them in
//       camelCase (first letter lowercase), so UserName -> userName.

export interface ApiUser {
  pkid: number;
  userName: string | null;   // C# "string?" means it can be empty (null)
  admin: boolean;
  firstName: string | null;
  occupation: string | null;
  // No password field on purpose. We never want to read it here.
}