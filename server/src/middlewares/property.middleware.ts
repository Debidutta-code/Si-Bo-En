import { Response, NextFunction } from "express";
import { PropertyCustomRequest } from '../utils/customRequest';
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
      if (req.property?.timezone) {
        return next();
      }

      const resolved = resolvePropertyIdentifier(req, rule);

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

      if (!property || !property.propertyConfigs) {
        return res
          .status(404)
          .json(errorResponse("Property or configuration not found"));
      }

      req.property = {
        id: property.id,
        propertyName: property.propertyName,
        propertyCode: property.propertyCode,
        timezone: property.propertyConfigs.timezone,
        currencyCode: property.propertyConfigs.baseCurrency,
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


export const resolvePropertyIdentifier = (
  req: PropertyCustomRequest,
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
      value = req.body?.[rule.key];
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

