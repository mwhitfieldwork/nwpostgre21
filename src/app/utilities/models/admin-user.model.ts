export interface AdminUser {
  pkid: number;
  username: string;
  firstname: string;
  lastname: string | null;
  isAdmin: boolean;
  occupation: string;
}