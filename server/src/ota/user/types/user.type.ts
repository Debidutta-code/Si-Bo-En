export interface ICUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string|null;
}
export interface IUUser {
    firstName: string;
    lastName: string;
    phoneNumber: string|null;
}
export interface IUser extends IUUser{
    id: string;
    email:string;
    createdAt: Date;
}
export interface IUserWP extends IUUser{
    id: string;
    email:string;
    createdAt: Date;
    password:string
}