export function toGMTExpiryString(secondsFromNow: number): string {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + secondsFromNow);
    return expiryDate.toISOString().replace('Z', '+00:00');
}
