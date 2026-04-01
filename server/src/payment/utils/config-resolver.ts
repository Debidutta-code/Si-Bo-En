import { prisma } from "../../config";

export interface PaymentIntegrationConfig {
  baseUrl: string;
  secrets: Record<string, string>;
  urls: Record<string, string>;
}

export class PaymentConfigResolver {
  /**
   * Resolve active payment integration configuration for a property.
   * @param propertyId The ID of the property
   * @param integrationName The name of the payment gateway (e.g., 'N-Genius', 'Fikafi')
   */
  public static async resolveConfig(propertyId: string, integrationName: string): Promise<PaymentIntegrationConfig | null> {
    const activeIntegration = await prisma.propertyPaymentIntegration.findFirst({
      where: {
        propertyId,
        isActive: true,
        paymentIntegration: {
          name: {
            equals: integrationName,
            mode: 'insensitive'
          }
        }
      },
      include: {
        paymentIntegration: {
          include: {
            masterPaymentIntegrationURLFields: true
          }
        },
        propertyPaymentIntegrationSecrets: {
          include: {
            RequiredField: true
          }
        }
      }
    });

    if (!activeIntegration) {
      return null;
    }

    const secrets: Record<string, string> = {};
    activeIntegration.propertyPaymentIntegrationSecrets.forEach((s: any) => {
      secrets[s.RequiredField.name] = s.value;
    });

    // Also include legacy outletId if present and not already in secrets
    if (activeIntegration.outletId && !secrets['outletId'] && !secrets['Outlet ID'] && !secrets['outlet_id']) {
      secrets['outletId'] = activeIntegration.outletId;
    }

    const urls: Record<string, string> = {};
    activeIntegration.paymentIntegration.masterPaymentIntegrationURLFields.forEach((u: any) => {
      urls[u.name] = u.url;
    });

    // Determine Base URL: look for 'Base URL' or 'baseUrl' in URL fields, or fallback to secrets if misconfigured
    const baseUrl = urls['Base URL'] || urls['baseUrl'] || urls['base_url'] || secrets['Base URL'] || secrets['baseUrl'] || secrets['base_url'] || '';

    return {
      baseUrl,
      secrets,
      urls
    };
  }

  /**
   * Resolve configuration by property code (useful for booking engine)
   */
  public static async resolveConfigByPropertyCode(propertyCode: string, integrationName: string): Promise<PaymentIntegrationConfig | null> {
    const property = await prisma.property.findFirst({
      where: { propertyCode },
      select: { id: true }
    });

    if (!property) return null;

    return this.resolveConfig(property.id, integrationName);
  }
}
