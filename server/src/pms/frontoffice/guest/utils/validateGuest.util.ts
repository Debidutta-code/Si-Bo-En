import { ICGuest } from "../types";
export function validateGuest(guestData: ICGuest) {
    if (!guestData.firstName) {
        return "Firstname Of Guest is required"
    }
    if (!guestData.lastName) {
        return "Last Name of Guest us required"
    }
    if (!guestData.email && guestData.userType === "adult") {
        return "Email is required for adults"
    }
    if (!guestData.phoneNumber && guestData.userType === "adult") {
        return "Phone Number is required for adult"
    }
    if (guestData.userType !== "adult" && guestData.userType != "child" && guestData.userType != "infant") {
        return "Guest Type Can Only be Adult, Child or Infant"
    }
    return null
}