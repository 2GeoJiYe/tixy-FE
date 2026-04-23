export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
  };
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  phone: string;
  name: string;
}

export interface SignUpResponse {
  email: string;
  message: string;
}
