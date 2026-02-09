import { CurrencyCode } from "@/pages/login/interface"

export interface ICharges {
  propertyCode:string
  ratePlanName:string
  ratePlanCode:string
  roomTypeCode:string
  roomTypeName:string
  currencyCode:CurrencyCode
  date:Date
  isAvailable:boolean
  // Days of week applicability

  isClosedToArrival:boolean
  isClosedToDeparture:boolean
  restrictionNotes:string|null

  // Relations
  baseGuestAmounts:IBaseByGuest[]
  additionalGuestAmounts:IChargeAdditionalGuest[]

}

export interface IBaseByGuest{
    amountBeforeTax:any
  numberOfGuests:number
}
export interface IChargeAdditionalGuest{
    ageQualifyingCode:string
  amount:any
}