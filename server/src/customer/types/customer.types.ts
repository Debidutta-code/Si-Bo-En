export interface ICustomer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;

}
export interface ICustomerwp {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password:string;
}


export interface ICustomerTokenPayload {
    id: string;
    email: string;
}