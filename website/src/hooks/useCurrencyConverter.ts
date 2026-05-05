import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";

interface UseCurrencyConverterResult {
    convertedAmount: number;
}

/**
 * USD → Selected Currency converter
 */
export const useCurrencyConverter = (
    usdAmount: number
): UseCurrencyConverterResult => {
    const { currency: selectedCurrency } = useSelector(
        (state: RootState) => state.booking
    );

    // 🔁 USD base exchange rates
    const rates: Record<string, number> = {
        USD: 1,
        AED: 3.67,
        EUR: 0.92,
        GBP: 0.78,
        INR: 83.2,
    };

    const result = useMemo(() => {
        if (!selectedCurrency) {
            return {
                convertedAmount: usdAmount,
            };
        }
        const rate = rates[selectedCurrency] ?? 1;
        const convertedAmount = Number((usdAmount * rate).toFixed(2));

        return {
            convertedAmount,
            currency: selectedCurrency,
            rate,
        };
    }, [usdAmount, selectedCurrency]);

    return result;
};
