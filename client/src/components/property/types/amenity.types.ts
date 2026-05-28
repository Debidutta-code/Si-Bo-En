export interface IAmenity{
    id:string;
    amenityName:string;
    icon:string|null;
    _translations?: {
        amenityName: string;
        description: string;
    }

}