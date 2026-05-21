export interface CustomerLoginPayload {
  email: string;
  password: string;
}

export interface CustomerRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CustomerAuthResponse {
  success: boolean;
  message: string;
  data?: Customer;
}