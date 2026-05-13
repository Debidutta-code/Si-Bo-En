import { prisma } from '../../config';
import { IApiResponse, successResponse, errorResponse } from '../../utils';
import {
    SpaPricingRepository,
    SpaDatesRepo,
    SpaRepository,
} from '../repository';
import { ICSpaPricing, IDSpaPricing } from '../types';

export class SpaPricingService {
    private spaPricingRepository: SpaPricingRepository;
    private spaDatesRepository: SpaDatesRepo;
    private spaRepository: SpaRepository;

    constructor() {
        this.spaPricingRepository = new SpaPricingRepository();
        this.spaDatesRepository = new SpaDatesRepo();
        this.spaRepository = new SpaRepository();
    }
    public async createSpaPricing(data: ICSpaPricing): Promise<IApiResponse> {
        try {
            const [reservation, spaDate] = await Promise.all([
                this.spaPricingRepository.getReservationById(
                    data.reservationId
                ),
                this.spaDatesRepository.getDateById(data.spaDateId),
            ]);
            if (!reservation) {
                return errorResponse('Reservation not found');
            }
            if (!spaDate) {
                return errorResponse('Spa date not found');
            }
            const [spa, pricingBrakedown] = await Promise.all([
                this.spaRepository.getById(spaDate.spaModuleId),
                this.spaPricingRepository.getPricingBreakdown(reservation.id),
            ]);
            if (!spa) {
                return errorResponse('Spa not found');
            }
            if (!spa.isActive) {
                return errorResponse('Spa is not active');
            }
            if (!reservation.pricingBrakedownId) {
                return errorResponse('Reservation pricing  not found');
            }
            if (spa.isInclusive) {
                await this.spaPricingRepository.createSpaPricing({
                    price: 0,
                    pricingId: reservation.pricingBrakedownId,
                    spaSlotId: data.spaSlotId,
                });
            } else {
                /*
                if tax is not inclusive then first get the applicable tax, sort it according to priority
                get the pricebrakedowwn, remote the old taxes,add the spa amount create new taxes and amount 
                 */
                const [applicableTaxes, taxRuleBrakedownDeleted] =
                    await Promise.all([
                        this.spaPricingRepository.getApplicableTaxes(
                            reservation.ratePlanCode
                        ),
                        this.spaPricingRepository.deleteTaxBrakedowns(
                            reservation.pricingBrakedownId
                        ),
                    ]);
                const sortedTaxRules = (
                    applicableTaxes?.taxGroup?.taxGroupRules || []
                ).sort(
                    (a, b) =>
                        (a.taxRule?.priority ?? 0) - (b.taxRule?.priority ?? 0)
                );
                const newTotalAmountBeforeTaxes =
                    (pricingBrakedown?.amountBeforeTax ?? 0) +
                    (spa.discountValue ? spa.discountValue : 0);
                const newTaxBreakdown = sortedTaxRules.map(rule => {
                    const value = rule.taxRule?.value ?? 0;
                    const baseAmount = spa.discountValue
                        ? spa.discountValue
                        : 0;

                    const taxAmount =
                        rule.taxRule?.type === 'percentage'
                            ? (baseAmount * value) / 100
                            : value;
                    return {
                        currencyCode: rule.taxRule?.currencyCode!,
                        taxedAmount: taxAmount,
                        name: rule.taxRule?.name!,
                        pricingBrakeDownId: reservation.pricingBrakedownId!,
                    };
                });
                const newTotalTaxedAmount = newTaxBreakdown.reduce(
                    (acc, curr) => acc + curr.taxedAmount,
                    0
                );
                const newFinalAmount =
                    newTotalAmountBeforeTaxes + newTotalTaxedAmount;
                await Promise.all([
                    this.spaPricingRepository.createSpaPricing({
                        price: spa.discountValue ? spa.discountValue : 0,
                        pricingId: reservation.pricingBrakedownId,
                        spaSlotId: data.spaSlotId,
                    }),
                    this.spaPricingRepository.updateReservationPricing({
                        reservationId: data.reservationId,
                        extraAmountToPay:
                            reservation.extraAmountToPay +
                            (spa.discountValue ? spa.discountValue : 0),
                    }),
                    this.spaPricingRepository.updatePriceBrakeDown({
                        priceBrakeDownId: reservation.pricingBrakedownId,
                        amountBeforeTax: newTotalAmountBeforeTaxes,
                        newTotalAmount: newFinalAmount,
                        totalSpaAmount:
                            (pricingBrakedown?.totalSpa ?? 0) +
                            (spa.discountValue ?? 0),
                        taxedAmount: newTotalTaxedAmount,
                    }),
                    await this.spaPricingRepository.createTaxBrakeDowns(
                        newTaxBreakdown
                    ),
                ]);
            }
            return successResponse('Spa slot created successfully');
        } catch (error) {
            // console.log(error);
            if (error instanceof Error) {
                return errorResponse(
                    'Error while creating spa pricing',
                    error.message
                );
            }
            return errorResponse('Error while creating spa pricing');
        }
    }
    public async deleteSpaPricing(data: IDSpaPricing): Promise<IApiResponse> {
        try {
            const [spaPricing, reservation] = await Promise.all([
                this.spaPricingRepository.getSpaPricingBySlotId(data.spaSlotId),
                this.spaPricingRepository.getReservationById(
                    data.reservationId
                ),
            ]);
            if (!spaPricing) {
                return errorResponse('Spa pricing not found');
            }
            if (!reservation) {
                return errorResponse('Reservation not found');
            }
            if (!reservation.pricingBrakedownId) {
                return errorResponse('Reservation pricing breakdown not found');
            }

            const pricingBrakedown =
                await this.spaPricingRepository.getPricingBreakdown(
                    reservation.id
                );
            if (!pricingBrakedown) {
                return errorResponse('Pricing breakdown not found');
            }

            // Fetch applicable taxes, delete the old tax breakdowns, and delete the spa pricing record itself
            const [applicableTaxes, _deletedTaxes, _deletedSpa] =
                await Promise.all([
                    this.spaPricingRepository.getApplicableTaxes(
                        reservation.ratePlanCode
                    ),
                    this.spaPricingRepository.deleteTaxBrakedowns(
                        reservation.pricingBrakedownId
                    ),
                    this.spaPricingRepository.deleteSpaPricing(data.spaSlotId),
                ]);

            // Recalculate amount before taxes by subtracting deleted spa pricing
            const newTotalAmountBeforeTaxes = Math.max(
                0,
                (pricingBrakedown.amountBeforeTax ?? 0) - spaPricing.price
            );
            const newTotalSpaAmount = Math.max(
                0,
                (pricingBrakedown.totalSpa ?? 0) - spaPricing.price
            );

            const sortedTaxRules = (
                applicableTaxes?.taxGroup?.taxGroupRules || []
            ).sort(
                (a, b) =>
                    (a.taxRule?.priority ?? 0) - (b.taxRule?.priority ?? 0)
            );
            const newTaxBreakdown = sortedTaxRules.map(rule => {
                const value = rule.taxRule?.value ?? 0;
                // @ts-ignore
                const taxAmount =
                    rule.taxRule?.type === 'percentage'
                        ? (newTotalAmountBeforeTaxes * value) / 100
                        : value;
                return {
                    currencyCode: rule.taxRule?.currencyCode!,
                    taxedAmount: taxAmount,
                    name: rule.taxRule?.name!,
                    pricingBrakeDownId: reservation.pricingBrakedownId!,
                };
            });

            const newTotalTaxedAmount = newTaxBreakdown.reduce(
                (acc, curr) => acc + curr.taxedAmount,
                0
            );
            const newFinalAmount =
                newTotalAmountBeforeTaxes + newTotalTaxedAmount;

            let refundableAmount = reservation.refundAmount;
            let newExtraAmountToPay =
                reservation.extraAmountToPay - spaPricing.price;

            //case for spa amount is paid and got cancelled
            if (
                reservation.amount + reservation.extraAmountToPay >=
                reservation.paidAmount
            ) {
                refundableAmount = spaPricing.price;
            }

            await Promise.all([
                this.spaPricingRepository.updatePricingForPaidAndCancelled({
                    reservationId: data.reservationId,
                    refundableAmount: refundableAmount,
                    extraAmountToPay: Math.max(0, newExtraAmountToPay),
                }),
                this.spaPricingRepository.updatePriceBrakeDown({
                    priceBrakeDownId: reservation.pricingBrakedownId,
                    amountBeforeTax: newTotalAmountBeforeTaxes,
                    newTotalAmount: newFinalAmount,
                    totalSpaAmount: newTotalSpaAmount,
                    taxedAmount: newTotalTaxedAmount,
                }),
                this.spaPricingRepository.createTaxBrakeDowns(newTaxBreakdown),
            ]);

            return successResponse('Spa slot deleted successfully');
        } catch (error) {
            // console.log(error);
            if (error instanceof Error) {
                return errorResponse(
                    'Error while deleting spa pricing',
                    error.message
                );
            }
            return errorResponse('Error while deleting spa pricing');
        }
    }
}
