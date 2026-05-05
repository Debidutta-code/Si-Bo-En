export const normalizePaymentIntegrationName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(' ', '_')
};