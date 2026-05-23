export interface ICustomerLoginResponse {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface ICustomerTokenPayload {
    id: string;
    email: string;
}