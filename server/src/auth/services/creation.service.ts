import { errorResponse, successResponse } from "../../utils/return";
import {
    CreationRepository,
    ManageCreationUser,
    CreationDetailsByCreationId,
    AddCreationToCreation,
    CreationDetailsByUserId
} from "../repository";
import { PropertyDao } from "../../property-management/repository/property.repository";
export default class CreationService {
    public static async create(
        type: "group" | "property" | "brand" | "super",
        name: string,
        userId: string,
        userLevel: number,
        usersCreation: string,
        images:string[] = []
    ) {
        try {
            // console.log(usersCreation)
            let daoRes;
            switch (userLevel) {
                case 2:
                    daoRes = await
                        CreationRepository.create(type,
                            name,
                            userId,
                            undefined,
                            undefined,
                            usersCreation,
                            images);
                    break;
                case 3:
                    daoRes = await
                        CreationRepository.create(type,
                            name,
                            userId,
                            undefined,
                            usersCreation,
                            undefined,
                            images);
                    break;
                case 4:
                    daoRes = await
                        CreationRepository.create(type,
                            name,
                            userId,
                            usersCreation,
                            undefined,
                            undefined,
                            images);
                    break;
                default:
                    return errorResponse("Invalid User Level")
            }
            if (daoRes) {
                let updateRes;
                updateRes = await this.addCreationToCreation(usersCreation, daoRes.id)
                // console.log("updateRes", updateRes)
                return successResponse("Created Successfully", daoRes)
            } else {
                return errorResponse("Failed to create")
            }
        } catch (error: any) {
            return errorResponse("Failed to create", error?.message)
        }
    }
    public static async update(creationId: string, name: string, images:string[] = [],isActive:boolean) {
        try {
            const daoRes = await CreationRepository.update(creationId, name, images,isActive);
            if (daoRes) {
                return successResponse("Updated Successfully", daoRes)
            } else {
                return errorResponse("Failed to update")
            }
        } catch (error: any) {
            return errorResponse("Failed to update", error?.message)
        }
    }

    public static async addUser(creationId: string, userId: string, userLevel: 0 | 1 | 2 | 3 | 4) {
        try {
            let daoRes: any;
            if (userLevel === 0) {
                daoRes = await ManageCreationUser.addLevel0User(userId, creationId);
            } else if (userLevel == 1) {

                daoRes = await ManageCreationUser.addLevel1User(userId, creationId);
            } else if (userLevel == 2) {

                daoRes = await ManageCreationUser.addLevel2User(userId, creationId);
            } else if (userLevel == 3) {

                daoRes = await ManageCreationUser.addLevel3User(userId, creationId);
            } else if (userLevel == 4) {

                daoRes = await ManageCreationUser.addLevel4User(userId, creationId);
            } else {
                return errorResponse("Invalid User Level")
            }
            if (daoRes) {
                return successResponse("Created Successfully", daoRes)
            } else {
                return errorResponse("Failed to create")
            }
        } catch (error: any) {
            return errorResponse("Failed to create", error?.message)
        }
    }
    public static async removeUser(userId: string, creationId: string, userLevel: 0 | 1 | 2 | 3) {
        try {
            let daoRes: any;
            if (userLevel === 0) {
                daoRes = await ManageCreationUser.removeLevel0User(userId, creationId);
            } else if (userLevel == 1) {

                daoRes = await ManageCreationUser.removeLevel1User(userId, creationId);
            } else if (userLevel == 2) {

                daoRes = await ManageCreationUser.removeLevel2User(userId, creationId);
            } else if (userLevel == 3) {

                daoRes = await ManageCreationUser.removeLevel3User(userId, creationId);
            } else {
                return errorResponse("Invalid User Level")
            }
            if (daoRes) {
                return successResponse("User Removed Successfully", daoRes)
            } else {
                return errorResponse("Failed to Remove User")
            }
        } catch (error: any) {
            return errorResponse("Failed to create", error?.message)
        }
    }
    public static async toggleDraft(creationId: string, val: boolean = true) {
        try {
            const daoRes = await CreationRepository.toggleDraft(creationId, val)
            if (daoRes) {
                return successResponse("Status changed Successfully")
            } else {
                return errorResponse("Failed to change status")
            }
        } catch (error: any) {
            return errorResponse("Failed to Change Status", error?.message)
        }
    }
    public static async getAll(type: "group" | "property" | "brand" | "super", isActive: boolean = true) {
        try {
            const daoRes = await CreationRepository.getAll(type, isActive)
            if (daoRes) {
                return successResponse("Created Successfully", daoRes)
            } else {
                return errorResponse("Failed to create")
            }
        } catch (error: any) {
            throw new Error(error?.message)
        }
    }
    public static async getPropertyByRole(
        requestUserLevel: number,
        creationId: string,
    ) {
        try {
            let creations: any[];
            switch (requestUserLevel) {
                case 4:
                    creations = await CreationRepository.getCreationsByRole({ superId: creationId });
                    break;
                case 3:
                    creations = await CreationRepository.getCreationsByRole({ groupId: creationId });
                    break;
                case 2:
                    creations = await CreationRepository.getCreationsByRole({ brandId: creationId });
                    break;
                default:
                    creations = [];
                    break;
            }
            if (creations) {
                return successResponse("Creations got for User", creations);
            } else {
                return errorResponse("Failed to get properties");
            }
        } catch (error: any) {
            return errorResponse('Failed to get properties', error.message);
        }
    }
    public static async getSpecificCreation(creationId: string) {
        try {
            const creation = await CreationRepository.getSpecificCreation(creationId);
            if (!creation) {
                return errorResponse('Creation Not found');
            } else {
                if (creation.type === "property") {
                    if (!creation.propertyId) {
                        return successResponse('Creation found But property has not created', { creation, propertyDetails: null });
                    }
                    let propertyDetails = await PropertyDao.getPropertyById(creation.propertyId, false)
                    if (!propertyDetails) {
                        propertyDetails = await PropertyDao.getPropertyById(creation.propertyId, true)
                    }
                    // console.log(propertyDetails)
                    return successResponse('Creation found with property details', { creation, propertyDetails: propertyDetails });
                }
                return successResponse('Creation found', creation);
            }
        } catch (error: any) {
            return errorResponse('Failed to get creation', error.message);
        }
    }
    public static async addCreationToCreation(parentCreationId: string, creationIdToBeAdded: string) {
        {
            try {
                const parentCreationDetails = await CreationRepository.getSpecificCreation(parentCreationId)
                // console.log(parentCreationDetails)
                if (!parentCreationDetails) {
                    throw new Error("Parent Creation Not found")
                }
                switch (parentCreationDetails.type) {
                    case "super":
                        return await AddCreationToCreation.addToSuper(parentCreationId, creationIdToBeAdded);

                    case "group":
                        return await AddCreationToCreation.addToGroup(parentCreationId, creationIdToBeAdded);

                    case "brand":
                        return await AddCreationToCreation.addToBrand(parentCreationId, creationIdToBeAdded)
                    default:
                        throw new Error("Property can be only created by Brand/Group/Super")
                }
            } catch (error: any) {
                if (error instanceof Error) {
                    throw new Error(error?.message)
                }
                throw new Error("Internal Server Error")
            }
        }

    }
}
export class FetchByCreationId {
    public static async getBrandManagers(groupId: string, type: "group" | "brand" | "property") {
        try {
            switch (type) {
                case "group":
                    const daoRes = await CreationDetailsByCreationId.getGroupManagersGroup(groupId)
                    if (daoRes) {
                        return successResponse("Group fetched Successfully", daoRes)
                    } else {
                        return errorResponse("Failed to fetch groupDetails")
                    }
                case "brand":
                    const gbDaoRes = await CreationDetailsByCreationId.getGroupManagersBrands(groupId)
                    if (gbDaoRes) {
                        return successResponse("Brands fetched Successfully", gbDaoRes)
                    } else {
                        return errorResponse("Failed to fetch brands")
                    }
                case "property":
                    const ggDaoRes = await CreationDetailsByCreationId.getGroupManagersBrands(groupId)
                    if (ggDaoRes) {
                        return successResponse("Property fetched Successfully", ggDaoRes)
                    } else {
                        return errorResponse("Failed to fetch groups")
                    }

                default:
                    return errorResponse("Invalid Type .type can only be group|brand|property")
            }
        } catch (error: any) {
            return errorResponse(`Failed to create groupManagers ${type}`, error?.message)
        }
    }
    public static async getGroupManagers(brandId: string, type: "brand" | "property") {
        try {
            switch (type) {
                case "brand":
                    const bbDaoRes = await CreationDetailsByCreationId.getBrandManagersBrand(brandId)
                    if (bbDaoRes) {
                        return successResponse("Brands fetched Successfully", bbDaoRes)
                    } else {
                        return errorResponse("Failed to fetch brands")
                    }
                case "property":
                    const bpDaoRes = await CreationDetailsByCreationId.getBrandManagersProperty(brandId)
                    if (bpDaoRes) {
                        return successResponse("Property fetched Successfully", bpDaoRes)
                    } else {
                        return errorResponse("Failed to fetch groups")
                    }

                default:
                    return errorResponse("Invalid Type!. type can only be brand|property")
            }
        } catch (error: any) {
            return errorResponse(`Failed to create groupManagers ${type}`, error?.message)
        }
    }
    public static async getPropertyManagers(propertyId: string, type: "property") {
        try {
            const ppDaoRes = await CreationDetailsByCreationId.getPropertyManagersProperty(propertyId)
            if (ppDaoRes) {
                return successResponse("Property fetched Successfully", ppDaoRes)
            } else {
                return errorResponse("Failed to fetch groups")
            }

        } catch (error: any) {
            return errorResponse(`Failed to create groupManagers ${type}`, error?.message)
        }
    }
}
export class FetchByUserId {
    public static async getBrandManagers(groupManagerId: string, type: "group" | "brand" | "property") {
        try {
            switch (type) {
                case "group":
                    const daoRes = await CreationDetailsByUserId.getGroupManagersGroup(groupManagerId)
                    if (daoRes) {
                        return successResponse("Group fetched Successfully", daoRes)
                    } else {
                        return errorResponse("Failed to fetch groupDetails")
                    }
                case "brand":
                    const gbDaoRes = await CreationDetailsByUserId.getGroupManagersBrands(groupManagerId)
                    if (gbDaoRes) {
                        return successResponse("Brands fetched Successfully", gbDaoRes)
                    } else {
                        return errorResponse("Failed to fetch brands")
                    }
                case "property":
                    const ggDaoRes = await CreationDetailsByUserId.getGroupManagersBrands(groupManagerId)
                    if (ggDaoRes) {
                        return successResponse("Property fetched Successfully", ggDaoRes)
                    } else {
                        return errorResponse("Failed to fetch groups")
                    }

                default:
                    return errorResponse("Invalid Type .type can only be group|brand|property")
            }
        } catch (error: any) {
            return errorResponse(`Failed to create groupManagers ${type}`, error?.message)
        }
    }
    public static async getGroupManagers(brandManagerId: string, type: "brand" | "property") {
        try {
            switch (type) {
                case "brand":
                    const bbDaoRes = await CreationDetailsByUserId.getBrandManagersBrand(brandManagerId)
                    if (bbDaoRes) {
                        return successResponse("Brands fetched Successfully", bbDaoRes)
                    } else {
                        return errorResponse("Failed to fetch brands")
                    }
                case "property":
                    const bpDaoRes = await CreationDetailsByUserId.getBrandManagersProperty(brandManagerId)
                    if (bpDaoRes) {
                        return successResponse("Property fetched Successfully", bpDaoRes)
                    } else {
                        return errorResponse("Failed to fetch groups")
                    }

                default:
                    return errorResponse("Invalid Type!. type can only be brand|property")
            }
        } catch (error: any) {
            return errorResponse(`Failed to create groupManagers ${type}`, error?.message)
        }
    }
    public static async getPropertyManagers(propertyManagerId: string, type: "property") {
        try {
            const ppDaoRes = await CreationDetailsByUserId.getPropertyManagersProperty(propertyManagerId)
            if (ppDaoRes) {
                return successResponse("Property fetched Successfully", ppDaoRes)
            } else {
                return errorResponse("Failed to fetch groups")
            }

        } catch (error: any) {
            return errorResponse(`Failed to create groupManagers ${type}`, error?.message)
        }
    }
}