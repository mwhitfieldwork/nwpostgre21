export interface AdminUser {
  pkid: number;
  username: string;
  firstname: string;
  lastname: string | null;
  admin: boolean;
  occupation: string;
}