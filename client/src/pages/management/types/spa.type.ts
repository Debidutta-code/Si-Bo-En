export interface ICSpaCatrgory {
    name: string;
}
export interface ISpaCategory extends ICSpaCatrgory {
    id: string;
    _translations?: {
        name: string;
    }

}
export interface ICSpaSubCategory {
    name: string;
    categoryId: string;
}
export interface IUSpaSubCategory {
    name: string;
    isActive: boolean;


}
export interface ISpaSubCategory extends ICSpaSubCategory {
    id: string;
    isActive: boolean;
    _translations?: {
        name: string;
    }
}