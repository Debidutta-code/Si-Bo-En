import { Response, NextFunction } from "express";
import { PropertyCustomRequest, PropertyRequest } from '../utils/customRequest';
import { prisma } from "../config";
import { errorResponse } from "../utils/return";
export type PropertySource = "params" | "query" | "body" | "headers";
export type PropertyIdentifierType = "id" | "code";

export interface PropertyResolveRule {
  source: PropertySource;
  key: string;
  identifierType: PropertyIdentifierType;
}

export function attachPropertyDetails(
  rule: PropertyResolveRule
) {
  return async (req: PropertyCustomRequest, res: Response, next: NextFunction) => {
    try {
      //console.log("rule", rule.key)
      if (req.property?.timezone) {
        return next();
      }
      //console.log(req.params)
      const resolved = resolvePropertyIdentifier(req, rule);
      //console.log("resolved", resolved)
      if (!resolved) {
        return res
          .status(400)
          .json(errorResponse("Property identifier not found"));
      }

      const property = await prisma.property.findFirst({
        where:
          resolved.type === "id"
            ? { id: resolved.value }
            : { propertyCode: resolved.value },
        include: {
          propertyConfigs: true,
        },
      });

      if (!property ) {
        return res
          .status(404)
          .json(errorResponse("Property or configuration not found"));
      }

      req.property = {
        id: property.id,
        propertyName: property.propertyName,
        propertyCode: property.propertyCode,
        timezone: property.propertyConfigs?.timezone,
        currencyCode: property.propertyConfigs?.baseCurrency,
        creationId: property.creationId,
      };

      next();
    } catch (error) {
      console.error("Attach property error:", error);
      return res
        .status(500)
        .json(
          errorResponse(
            "Internal server error",
            "Error attaching property details"
          )
        );
    }
  };
}


/**
 * Helper function to get nested value from an object using dot notation
 * e.g., getNestedValue(obj, "data.bookingDetails.propertyCode")
 */
const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
};

export const resolvePropertyIdentifier = (
  req: PropertyCustomRequest | PropertyRequest,
  rule: PropertyResolveRule
): { type: "id" | "code"; value: string } | null => {
  let value: any;

  switch (rule.source) {
    case "params":
      value = req.params?.[rule.key];
      break;

    case "query":
      value = req.query?.[rule.key];
      break;

    case "body":
      // Support nested keys like "data.bookingDetails.propertyCode"
      value = getNestedValue(req.body, rule.key);
      break;

    case "headers":
      value = req.headers?.[rule.key.toLowerCase()];
      if (Array.isArray(value)) value = value[0];
      break;
  }

  if (typeof value === "string" && value.trim()) {
    return {
      type: rule.identifierType,
      value: value.trim(),
    };
  }

  return null;
};

