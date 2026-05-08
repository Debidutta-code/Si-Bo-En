// src/modules/google-feeds/utils/xml-builder.util.ts

import {
    IGoogleHotelListItem,
    IGooglePriceItem,
    IGoogleLandingPageItem,
} from '../interfaces';

export class GoogleFeedsXMLBuilder {
    /**
     * Escape XML special characters
     */
    private static escapeXml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Build Hotel List Feed XML
     */
    public static buildHotelListFeed(hotels: IGoogleHotelListItem[]): string {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="http://www.gstatic.com/localfeed/local_feed.xsd">
`;

        for (const hotel of hotels) {
            xml += `  <listing>
    <id>${this.escapeXml(hotel.hotelId)}</id>
    <name>${this.escapeXml(hotel.hotelName)}</name>
    <address format="simple">
      <component name="addr1">${this.escapeXml(hotel.addressLine1)}</component>
`;
            if (hotel.addressLine2) {
                xml += `      <component name="addr2">${this.escapeXml(hotel.addressLine2)}</component>
`;
            }
            xml += `      <component name="city">${this.escapeXml(hotel.city)}</component>
      <component name="province">${this.escapeXml(hotel.state)}</component>
      <component name="postal_code">${this.escapeXml(hotel.zipCode)}</component>
    </address>
    <country>${this.escapeXml(hotel.country)}</country>
    <latitude>${hotel.latitude}</latitude>
    <longitude>${hotel.longitude}</longitude>
    <phone type="main">${this.escapeXml(hotel.phoneNumber)}</phone>
    <category>hotel</category>
`;
            if (hotel.websiteUrl) {
                xml += `    <website>${this.escapeXml(hotel.websiteUrl)}</website>
`;
            }
            xml += `  </listing>
`;
        }

        xml += `</listings>`;
        return xml;
    }

    /**
     * Build Price & Availability Feed XML
     */
    public static buildPriceFeed(prices: IGooglePriceItem[]): string {
        const timestamp = new Date().toISOString();
        const transactionId = Date.now();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${timestamp}" id="${transactionId}">
`;

        // Group by property
        const groupedByProperty = this.groupByProperty(prices);

        for (const [propertyCode, propertyPrices] of Object.entries(
            groupedByProperty
        )) {
            xml += `  <PropertyDataSet>
    <Property>${this.escapeXml(propertyCode)}</Property>
`;

            for (const price of propertyPrices) {
                xml += `    <RoomData>
      <RoomID>${this.escapeXml(price.roomId)}</RoomID>
      <Name>
        <Text text="${this.escapeXml(price.roomName)}" language="en"/>
      </Name>
`;
                if (price.roomDescription) {
                    xml += `      <Description>
        <Text text="${this.escapeXml(price.roomDescription)}" language="en"/>
      </Description>
`;
                }
                xml += `      <Capacity>${price.maxOccupancy}</Capacity>
      <Occupancy>2</Occupancy>
      <OccupancyDetails>
        <NumAdults>2</NumAdults>
      </OccupancyDetails>
      <RatePlan id="${this.escapeXml(price.ratePlanId)}">
        <ChargeCurrency>${this.escapeXml(price.currencyCode)}</ChargeCurrency>
        <Baserate currency="${this.escapeXml(price.currencyCode)}">${price.baseRate.toFixed(2)}</Baserate>
        <Tax currency="${this.escapeXml(price.currencyCode)}">${price.tax.toFixed(2)}</Tax>
        <OtherFees currency="${this.escapeXml(price.currencyCode)}">${price.otherFees.toFixed(2)}</OtherFees>
        <RatePlanName>
          <Text text="${this.escapeXml(price.ratePlanName)}" language="en"/>
        </RatePlanName>
        <Checkin>${price.checkInDate}</Checkin>
        <Nights>${price.nights}</Nights>
      </RatePlan>
    </RoomData>
`;
            }

            xml += `  </PropertyDataSet>
`;
        }

        xml += `</Transaction>`;
        return xml;
    }

    /**
     * Build Landing Page Feed XML
     */
    public static buildLandingPageFeed(
        landingPages: IGoogleLandingPageItem[]
    ): string {
        const timestamp = new Date().toISOString();
        const transactionId = Date.now();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${timestamp}" id="${transactionId}">
`;

        // Group by property
        const groupedByProperty: Record<string, IGoogleLandingPageItem[]> = {};
        for (const lp of landingPages) {
            if (!groupedByProperty[lp.hotelId]) {
                groupedByProperty[lp.hotelId] = [];
            }
            groupedByProperty[lp.hotelId].push(lp);
        }

        for (const [propertyCode, pages] of Object.entries(groupedByProperty)) {
            xml += `  <PropertyDataSet>
    <Property>${this.escapeXml(propertyCode)}</Property>
`;

            for (const page of pages) {
                xml += `    <PackageData>
      <Occupancy>${page.occupancy}</Occupancy>
      <ChainBaseRate currency="${this.escapeXml(page.currencyCode)}">${page.baseRate.toFixed(2)}</ChainBaseRate>
      <Tax currency="${this.escapeXml(page.currencyCode)}">${page.tax.toFixed(2)}</Tax>
      <OtherFees currency="${this.escapeXml(page.currencyCode)}">${page.otherFees.toFixed(2)}</OtherFees>
      <URL>${this.escapeXml(page.landingPageUrl)}</URL>
    </PackageData>
`;
            }

            xml += `  </PropertyDataSet>
`;
        }

        xml += `</Transaction>`;
        return xml;
    }

    /**
     * Group prices by property code
     */
    private static groupByProperty(
        prices: IGooglePriceItem[]
    ): Record<string, IGooglePriceItem[]> {
        const grouped: Record<string, IGooglePriceItem[]> = {};
        for (const price of prices) {
            if (!grouped[price.hotelId]) {
                grouped[price.hotelId] = [];
            }
            grouped[price.hotelId].push(price);
        }
        return grouped;
    }
}
