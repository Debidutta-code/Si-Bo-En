export interface ICSpaPricingR {
    reservationId: string;
    spaSlotId: string;
    price: number;
}
export interface ISpaPricing extends ICSpaPricingR {
    id: string;
}