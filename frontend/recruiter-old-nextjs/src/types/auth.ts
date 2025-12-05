export interface LoginCredentials {
  email: string;
  password: string;
  trustDevice?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'recruiter' | 'admin';
  companyId?: string;
  avatar?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface SocialLoginProvider {
  name: 'google' | 'linkedin';
  url: string;
}
