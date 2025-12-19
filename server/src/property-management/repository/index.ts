import { BankDetailsDao } from "./bankDetails.repository";
import { UserDao } from "./hierarchy.repository";
import {
    PropertyDao,
    PropertyAddressDao,
    PropertyAmenityDao
} from "./property.repository";
import {PropertyConfigRepo} from "./property-config.repository"
import { RoomAmenityDao, RoomDao } from "./room.repository";
import {
    CategoryDao,
    DestinationTypeDao,
    DestinationTypeSelectionDao,
    PropertyAmenitySelectionDao,
    PropertyAminityDao,
    PropertyCategorySelectionDao,
    PropertyTypeSelectionDao,
    PropertyTypesDao,
    RoomAminityDao
} from "./types.repository";


export{
    BankDetailsDao,
    UserDao,
    PropertyDao,
    PropertyAddressDao,
    PropertyAmenityDao,
    RoomAmenityDao,
    RoomDao,
    CategoryDao,
    DestinationTypeDao,
    DestinationTypeSelectionDao,
    PropertyAmenitySelectionDao,
    PropertyAminityDao,
    PropertyCategorySelectionDao,
    PropertyTypeSelectionDao,
    PropertyTypesDao,
    RoomAminityDao,
    PropertyConfigRepo
}