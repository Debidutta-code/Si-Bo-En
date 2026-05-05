import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { GBPRepository } from "../dao";
import { IGroups, IBrands, IProperties } from "../interfaces";

export interface IFilterOptionsResult {
    creationType: "super" | "group" | "brand" | "property" | "regional";
    groups: IGroups[];
    brands: IBrands[];
    properties: IProperties[];
}

export class GBPService {
    private repository: GBPRepository;

    constructor() {
        this.repository = new GBPRepository();
    }

    /**
     * Returns the filter options (groups, brands, properties) available
     * to the user based on their creation type / level.
     *
     * - Super  → groups + brands + properties
     * - Group  → brands + properties (within that group)
     * - Brand  → properties (within that brand)
     * - Property → empty (no filters needed)
     */
    public async getFilterOptions(creationId: string): Promise<IApiResponse<IFilterOptionsResult>> {
        try {
            const creation = await this.repository.getCreationDetails(creationId);

            if (!creation) {
                return errorResponse("Unable to find creation details");
            }

            let groups: IGroups[] = [];
            let brands: IBrands[] = [];
            let properties: IProperties[] = [];

            switch (creation.type) {
                case "super": {
                    const superChildren = await this.repository.getSuperChildren();
                    groups = superChildren.groups;
                    brands = superChildren.brands;
                    properties = superChildren.properties;
                    break;
                }
                case "group": {
                    const groupChildren = await this.repository.getGroupChildren(creationId);
                    brands = groupChildren.brands;
                    properties = groupChildren.properties;
                    break;
                }
                case "brand": {
                    const brandChildren = await this.repository.getBrandChildren(creationId);
                    properties = brandChildren.properties;
                    break;
                }
                case "property":
                    // Property-level users have no filters
                    break;
                default:
                    return errorResponse("Unsupported creation type");
            }

            return successResponse("Filter options fetched successfully", {
                creationType: creation.type,
                groups,
                brands,
                properties,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while fetching filter options", error.message);
            }
            return errorResponse("Error occurred while fetching filter options", "Unknown error occurred");
        }
    }
}