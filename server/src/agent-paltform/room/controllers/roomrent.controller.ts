import { Response } from 'express';
import { errorResponse } from '../../../utils/return';
import { AgentRequest } from '../../utils';
import { AgentPricingService } from '../services';
import { toUTC } from '../../../utils';
import { IAgentPricingRequest, IGuestDistributionEntry } from '../types';

export class AgentPricingController {
    private pricingService: AgentPricingService;

    constructor() {
        this.pricingService = new AgentPricingService();
    }

    public async getAgentPricing(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agentAgencyId = req.agent?.agencyId;

            if (!agentId || !agentAgencyId) {
                return res.status(401).json(
                    errorResponse('Unauthorized', 'Agent not authenticated')
                );
            }

            const {
                propertyCode,
                invTypeCode,
                ratePlanCode,
                startDate,
                endDate,
                noOfAdults,
                noOfChildren,
                noOfRooms,
                childAges,
                guestDistribution,
                agencyId,
                includedAddons,
            } = req.body;

            // ── Required field validation ────────────────────────────────────
            if (!propertyCode) {
                return res.status(400).json(errorResponse('Property code is required'));
            }
            if (!invTypeCode) {
                return res.status(400).json(errorResponse('Room type code is required'));
            }
            if (!ratePlanCode) {
                return res.status(400).json(errorResponse('Rate plan code is required'));
            }
            if (!startDate) {
                return res.status(400).json(errorResponse('Start date is required'));
            }
            if (!endDate) {
                return res.status(400).json(errorResponse('End date is required'));
            }
            if (!agencyId) {
                return res.status(400).json(errorResponse('Agency ID is required'));
            }

            // Agency must match the authenticated agent's agency
            if (agencyId !== agentAgencyId) {
                return res.status(403).json(
                    errorResponse('Forbidden', 'Agency ID does not match authenticated agent')
                );
            }

            // ── Guest count validation ────────────────────────────────────────
            const adults = Number(noOfAdults);
            const children = Number(noOfChildren);
            const rooms = Number(noOfRooms);

            if (isNaN(adults) || adults < 1) {
                return res.status(400).json(errorResponse('At least 1 adult is required'));
            }
            if (isNaN(children) || children < 0) {
                return res.status(400).json(errorResponse("Number of children can't be negative"));
            }
            if (isNaN(rooms) || rooms < 1) {
                return res.status(400).json(errorResponse('At least 1 room is required'));
            }

            // ── Guest distribution validation ────────────────────────────────
            if (!guestDistribution || !Array.isArray(guestDistribution)) {
                return res.status(400).json(errorResponse('guestDistribution array is required'));
            }
            if (guestDistribution.length !== rooms) {
                return res.status(400).json(
                    errorResponse(`guestDistribution must have exactly ${rooms} entr${rooms === 1 ? 'y' : 'ies'} matching noOfRooms`)
                );
            }

            const typedGuestDistribution: IGuestDistributionEntry[] = guestDistribution.map(
                (entry: IGuestDistributionEntry, index: number) => {
                    if (
                        typeof entry.adults !== 'number' ||
                        typeof entry.children !== 'number' ||
                        !Array.isArray(entry.childAges)
                    ) {
                        throw new Error(
                            `guestDistribution[${index}] must have adults (number), children (number), childAges (array)`
                        );
                    }
                    return {
                        adults: entry.adults,
                        children: entry.children,
                        childAges: entry.childAges,
                    };
                }
            );

            // ── includedAddons — always an array, never undefined ────────────
            const typedIncludedAddons: string[] = Array.isArray(includedAddons)
                ? includedAddons.filter((id: unknown) => typeof id === 'string')
                : [];

            const payload: IAgentPricingRequest = {
                propertyCode: String(propertyCode),
                invTypeCode: String(invTypeCode),
                ratePlanCode: String(ratePlanCode),
                startDate: toUTC(startDate),
                endDate: toUTC(endDate),
                noOfAdults: adults,
                noOfChildren: children,
                noOfRooms: rooms,
                childAges: Array.isArray(childAges) ? childAges : [],
                guestDistribution: typedGuestDistribution,
                agencyId: String(agencyId),
                includedAddons: typedIncludedAddons,
            };

            const result = await this.pricingService.getAgentPricing(payload);

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(
                    errorResponse('Failed to calculate pricing', error.message)
                );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
}