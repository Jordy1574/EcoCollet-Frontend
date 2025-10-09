export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'USER' | 'BUSINESS' | 'DRIVER' | 'ADMIN';
}
