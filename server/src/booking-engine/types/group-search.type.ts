export interface IGroupSearchQuerry {
    groupId: string;
    city: string;
    startDate: string;
    endDate: string;
    guests: {
        adults: number;
        children: number;
        rooms: number;
        roomsArray: { adults: number; children: number; childAges: number[] }[];
    };
}