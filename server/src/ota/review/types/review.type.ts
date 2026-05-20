export interface ICReview {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    customerId: string;
    reservationId: string;
    rating: number;
    review: string;
}

export interface IUReview {
    rating: number;
    review: string;
}

export interface IReview extends ICReview {
    id: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
