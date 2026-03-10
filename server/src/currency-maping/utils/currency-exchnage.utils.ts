import {RedisClient,prisma} from '../../config';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

const getRateFromHash = async (currency: CurrencyCode): Promise<number> => {
    const client = RedisClient.getInstance();
    const rate = await client.hGet('exchange:rates:hash', currency.toString());
    if (!rate) throw new Error(`Exchange rate not found for: ${currency}`);
    return parseFloat(rate);
};

export const convertCurrency = async (
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
): Promise<number> => {
    if (fromCurrency === toCurrency) return amount;

    const [fromRate, toRate] = await Promise.all([
        getRateFromHash(fromCurrency),
        getRateFromHash(toCurrency),
    ]);

    const inUSD = amount / fromRate;
    const converted = inUSD * toRate;

    return Math.round(converted * 100) / 100;
};

export const getPropertyBaseCurrency = async (propertyId: string): Promise<CurrencyCode> => {
    if (!propertyId) {
        throw new Error('propertyId is required for getPropertyBaseCurrency');
    }

    const config = await prisma.propertyConfigs.findUnique({
        where: { propertyId },
        select: { baseCurrency: true },
    });

    if (!config) throw new Error(`PropertyConfig not found for propertyId: ${propertyId}`);

    return config.baseCurrency;
};

export const convertToPropertyCurrency = async (
    amount: number,
    fromCurrency: CurrencyCode,
    propertyId: string
): Promise<{ convertedAmount: number; baseCurrency: CurrencyCode }> => {
    if (!propertyId) {
        throw new Error('propertyId is required for convertToPropertyCurrency');
    }

    const baseCurrency = await getPropertyBaseCurrency(propertyId);
    const convertedAmount = await convertCurrency(amount, fromCurrency, baseCurrency);
    return { convertedAmount, baseCurrency };
};



export const getCurrencyConverter = async (
    propertyId: string,
    fromCurrency: CurrencyCode
): Promise<{
    convert: (amount: number) => number;
    baseCurrency: CurrencyCode;
    multiplier: number;
}> => {
    if (!propertyId) {
        throw new Error('propertyId is required for getCurrencyConverter');
    }

    const baseCurrency = await getPropertyBaseCurrency(propertyId);
    if (fromCurrency === baseCurrency) {
        return {
            convert: (amount: number) => amount,
            baseCurrency,
            multiplier: 1,
        };
    }
    const [fromRate, toRate] = await Promise.all([
        getRateFromHash(fromCurrency),
        getRateFromHash(baseCurrency),
    ]);

    const multiplier = toRate / fromRate;

    return {
        convert: (amount: number) => Math.round(amount * multiplier * 100) / 100,
        baseCurrency,
        multiplier, 
    };
};
