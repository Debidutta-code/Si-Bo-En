import { IBookingAddon } from "../interfaces";
import {prisma} from "../../config";
export default class BookingAddOnRepository {
    public static async createBookingAddon(
        bookingId: string,
        addonId: string,
        name: string,
        unitPrice: number,
        quantity: number,
        totalPrice: number,
        currencyCode: string,
        specialInstructions: string,
        date: Date
    ) {
        try {
            return await prisma.bookingAddon.create({
                data: {
                    reservationId:bookingId,
                    addonId,
                    name,
                    unitPrice,
                    quantity,
                    totalPrice,
                    currencyCode,
                    specialInstructions,
                    date
                }
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to create Booking Add on ")
        }
    }
    public static async updateBookingAddOnByBookingId(bookingId: string, updateBody: Partial<IBookingAddon>): Promise<IBookingAddon | null> {
        try {
            return await prisma.bookingAddon.update({
                where: { id: bookingId },
                data: updateBody
            }) 
        } catch (error) {
            throw new Error("Failed to Update Booking addon")
        }
    }
    public static async deleteBookingAddOnById(id: string): Promise<any> {
        try {
            return await prisma.bookingAddon.delete({ where: { id: id } })
        } catch (error) {
            throw new Error("Failed to delete Addon")
        }
    }

}