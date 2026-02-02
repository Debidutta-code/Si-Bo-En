'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Package, ChevronRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/src/components/ui/dialog';

interface AddonAvailability {
    id: string;
    addonId: string;
    date: string;
    price: number;
    currencyCode: string;
    isAvailable: boolean;
    addon: {
        id: string;
        name: string;
        code: string;
        description?: string;
        postingRhythm: string;
        images?: string[];
        category?: { code: string; name: string };
        subCategory?: { code: string; name: string };
        addonVariant?: { code: string; name: string };
    };
}

interface SelectedAddon {
    addonId: string;
    addonName: string;
    addonCode: string;
    availabilityId: string;
    date: string;
    price: number;
    quantity: number;
    totalPrice: number;
    type: string;
}

interface AddonSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    addons: AddonAvailability[];
    bookingDates: string[];
    onContinue: (selectedAddons: SelectedAddon[]) => void;
    onSkip: () => void;
    primaryColor?: string;
    buttonTextColor?: string;
    currencyCode?: string;
}

// Group addons by addon ID for display
const groupAddonsByAddonId = (addons: AddonAvailability[]) => {
    const grouped: Record<string, { addon: AddonAvailability['addon']; availabilities: AddonAvailability[] }> = {};

    addons.forEach((av) => {
        if (!grouped[av.addonId]) {
            grouped[av.addonId] = {
                addon: av.addon,
                availabilities: []
            };
        }
        grouped[av.addonId].availabilities.push(av);
    });

    return Object.values(grouped);
};

const AddonSelectionModal: React.FC<AddonSelectionModalProps> = ({
    isOpen,
    onClose,
    addons,
    bookingDates,
    onContinue,
    onSkip,
    primaryColor = '#FF6B35',
    buttonTextColor = '#FFFFFF',
    currencyCode = 'USD'
}) => {
    const [selectedAddons, setSelectedAddons] = useState<Record<string, SelectedAddon>>({});
    const [showAllAddons, setShowAllAddons] = useState(false);

    const groupedAddons = groupAddonsByAddonId(addons);

    const handleQuantityChange = (
        addon: AddonAvailability['addon'],
        availability: AddonAvailability,
        quantity: number
    ) => {
        const key = `${addon.id}-${availability.id}`;

        setSelectedAddons(prev => {
            const newState = { ...prev };

            if (quantity <= 0) {
                delete newState[key];
            } else {
                newState[key] = {
                    addonId: addon.id,
                    addonName: addon.name,
                    addonCode: addon.code,
                    availabilityId: availability.id,
                    date: availability.date,
                    price: availability.price,
                    quantity: quantity,
                    totalPrice: availability.price * quantity,
                    type: addon.postingRhythm
                };
            }
            return newState;
        });
    };

    const handleContinue = () => {
        const selectedList = Object.values(selectedAddons);
        onContinue(selectedList);
        setSelectedAddons({});
    };

    const handleSkip = () => {
        setSelectedAddons({});
        onSkip();
    };

    const totalAddonsPrice = Object.values(selectedAddons).reduce(
        (sum, addon) => sum + addon.totalPrice,
        0
    );
    const totalAddonsCount = Object.values(selectedAddons).reduce(
        (sum, addon) => sum + addon.quantity,
        0
    );

    const displayedAddons = showAllAddons ? groupedAddons : groupedAddons.slice(0, 4);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-orange-500" />
                        Enhance Your Stay
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Select optional add-ons to make your stay even more memorable
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 px-1">
                    {groupedAddons.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No add-ons available for your selected dates</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayedAddons.map(({ addon, availabilities }) => {
                                    // Filter availabilities to only show those in booking dates
                                    const relevantAvailabilities = availabilities.filter(av =>
                                        bookingDates.includes(av.date.split('T')[0])
                                    );

                                    if (relevantAvailabilities.length === 0) return null;

                                    return (
                                        <div
                                            key={addon.id}
                                            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex gap-3">
                                                {addon.images?.[0] && (
                                                    <img
                                                        src={addon.images[0]}
                                                        alt={addon.name}
                                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                                                    />
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h5 className="font-bold text-sm text-gray-900 leading-tight">
                                                            {addon.name}
                                                        </h5>
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                                                            {addon.postingRhythm}
                                                        </span>
                                                    </div>

                                                    {addon.description && (
                                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                            {addon.description}
                                                        </p>
                                                    )}

                                                    <div className="space-y-2 mt-2">
                                                        {relevantAvailabilities.map((availability) => {
                                                            const key = `${addon.id}-${availability.id}`;
                                                            const currentQuantity = selectedAddons[key]?.quantity || 0;

                                                            return (
                                                                <div
                                                                    key={availability.id}
                                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200"
                                                                >
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-medium text-gray-800">
                                                                            {new Date(availability.date).toLocaleDateString('en-US', {
                                                                                weekday: 'short',
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">
                                                                            {currencyCode} {availability.price} each
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        {currentQuantity > 0 && (
                                                                            <span className="text-xs font-semibold text-orange-600">
                                                                                {currencyCode} {(availability.price * currentQuantity).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                        <div className="flex items-center">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleQuantityChange(
                                                                                        addon,
                                                                                        availability,
                                                                                        Math.max(0, currentQuantity - 1)
                                                                                    )
                                                                                }
                                                                                disabled={currentQuantity === 0}
                                                                                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                                                            >
                                                                                <Minus size={12} />
                                                                            </button>
                                                                            <span className="w-8 text-center font-bold text-sm text-gray-900">
                                                                                {currentQuantity}
                                                                            </span>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleQuantityChange(addon, availability, currentQuantity + 1)
                                                                                }
                                                                                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                                                                                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
                                                                            >
                                                                                <Plus size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {groupedAddons.length > 4 && (
                                <button
                                    onClick={() => setShowAllAddons(!showAllAddons)}
                                    className="mt-4 text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1 hover:underline"
                                >
                                    {showAllAddons ? 'Show Less' : `See ${groupedAddons.length - 4} More Add-ons`}
                                    <ChevronRight
                                        size={14}
                                        className={`transform transition-transform ${showAllAddons ? 'rotate-90' : ''}`}
                                    />
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-sm text-gray-700">
                        {totalAddonsCount > 0 ? (
                            <span>
                                <span className="font-semibold">{totalAddonsCount}</span> add-on{totalAddonsCount > 1 ? 's' : ''} selected •
                                <span className="font-bold text-orange-600 ml-1">
                                    {currencyCode} {totalAddonsPrice.toLocaleString()}
                                </span>
                            </span>
                        ) : (
                            <span className="text-gray-500">No add-ons selected</span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSkip}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition-all border border-gray-300"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleContinue}
                            style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow hover:shadow-md hover:opacity-90"
                        >
                            {totalAddonsCount > 0
                                ? `Continue with ${totalAddonsCount} Add-on${totalAddonsCount > 1 ? 's' : ''}`
                                : 'Continue'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddonSelectionModal;
