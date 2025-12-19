export interface IUser{
    firstName:string;
    lastName:string;
    role:string;
    email:string;
    id:string;
    level:number;
}
export interface ICreateUser{
  firstName:string;
  lastName:string;
  email:string;
  password:string;
  confirmPassword:string;
  name?:string;
  role:string;
  level:number;
}
export interface INewCreation{
  id:string;
  name:string;
}
export interface IRoleAccess{
  role:string;
  level:number;
}