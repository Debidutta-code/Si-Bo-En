export const convertToPropertyValue=(
    propertyCode:string,
    currencyValue:number,
    currentCurrencyCode:string
)=>{
    return {
        propertyCode,
        currencyValue,
        currentCurrencyCode
    };
}