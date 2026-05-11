export interface ICUserAssignedSpa {
    userId: string;
    spaId: string;
}
export interface ISpaUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
export interface ISpaWUser extends ICUserAssignedSpa {
    User: ISpaUser;
}
